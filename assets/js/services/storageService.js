/**
 * ============================================================
 * ETU PORTAL - IMAGE STORAGE SERVICE
 * ============================================================
 *
 * PURPOSE:
 *
 * Handles all Supabase Storage operations.
 *
 * Pages/components should NOT directly call:
 *
 *     supabase.storage...
 *
 * They should use the functions in this service.
 *
 *
 * RESPONSIBILITIES:
 *
 * - validate selected images
 * - create safe unique file names
 * - upload images
 * - get public URLs
 * - remove uploaded images
 *
 * ============================================================
 */


import {

    supabase

} from './supabase.js';


import {

    assertAdmin

} from './authService.js';


import {

    IMAGE_BUCKET,

    MAX_IMAGE_SIZE,

    MAX_IMAGE_SIZE_LABEL,

    ALLOWED_IMAGE_TYPES,

    ALLOWED_IMAGE_EXTENSIONS

} from '../config/images.js';



/**
 * ============================================================
 * FILE VALIDATION
 * ============================================================
 */


/**
 * validateImageFile()
 *
 * Verifies:
 *
 * - a file actually exists
 * - allowed MIME type
 * - allowed extension
 * - maximum 2 MB
 *
 * Throws a readable error when validation fails.
 */
export function validateImageFile(file) {

    if (
        !(file instanceof File)
    ) {

        throw new Error(
            'Please select an image file.'
        );
    }


    /**
     * --------------------------------------------------------
     * FILE EXTENSION
     * --------------------------------------------------------
     */

    const extension =
        file.name
            .split('.')
            .pop()
            ?.toLowerCase();


    if (
        !ALLOWED_IMAGE_EXTENSIONS.includes(
            extension
        )
    ) {

        throw new Error(

            `${file.name}: only JPG, JPEG, PNG and WEBP images are allowed.`
        );
    }


    /**
     * --------------------------------------------------------
     * MIME TYPE
     * --------------------------------------------------------
     */

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.type
        )
    ) {

        throw new Error(

            `${file.name}: unsupported image type.`
        );
    }


    /**
     * --------------------------------------------------------
     * FILE SIZE
     * --------------------------------------------------------
     */

    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {

        throw new Error(

            `${file.name} is larger than ${MAX_IMAGE_SIZE_LABEL}.`
        );
    }


    return true;
}



/**
 * ============================================================
 * SAFE STORAGE FILE NAME
 * ============================================================
 */


/**
 * getExtension()
 *
 * Returns:
 *
 * photo.jpeg → jpeg
 */
function getExtension(file) {

    return file.name
        .split('.')
        .pop()
        .toLowerCase();
}


/**
 * createUniqueFileName()
 *
 * We do not rely on the original filename because:
 *
 * - two students may upload image.jpg
 * - filenames may contain awkward characters
 *
 *
 * Example result:
 *
 * 6f4d3e0c-1b54-4ca5-9cf2-f6bf1e83d71a.jpg
 */
function createUniqueFileName(file) {

    const extension =
        getExtension(file);


    /**
     * Modern browsers support crypto.randomUUID().
     */
    const uniqueId =
        crypto.randomUUID();


    return (
        `${uniqueId}.${extension}`
    );
}



/**
 * ============================================================
 * UPLOAD ONE IMAGE
 * ============================================================
 */


/**
 * uploadImage()
 *
 * Parameters:
 *
 * file
 *     Browser File object.
 *
 * folder
 *     Folder location inside etu-images.
 *
 *
 * Example:
 *
 * uploadImage(
 *     selectedFile,
 *     'groups/ab01/cover'
 * )
 *
 *
 * Returns:
 *
 * {
 *     publicUrl,
 *     storagePath
 * }
 */
export async function uploadImage(

    file,

    folder
) {

    /**
     * Confirm administrator access first.
     */
    await assertAdmin();


    /**
     * Browser validation before upload.
     */
    validateImageFile(
        file
    );


    /**
     * Generate collision-safe filename.
     */
    const fileName =
        createUniqueFileName(
            file
        );


    /**
     * Remove leading/trailing slashes from folder.
     */
    const cleanFolder =
        String(folder || 'general')

            .replace(
                /^\/+|\/+$/g,
                ''
            );


    /**
     * Final Supabase object path.
     */
    const storagePath =
        `${cleanFolder}/${fileName}`;


    /**
     * --------------------------------------------------------
     * UPLOAD TO SUPABASE STORAGE
     * --------------------------------------------------------
     */

    const {

        error

    } =
        await supabase

            .storage

            .from(
                IMAGE_BUCKET
            )

            .upload(

                storagePath,

                file,

                {
                    /**
                     * Browser/CDN may cache for one hour.
                     */
                    cacheControl:
                        '3600',


                    /**
                     * We always create unique filenames.
                     *
                     * Therefore there is no reason to overwrite
                     * another object.
                     */
                    upsert:
                        false,


                    /**
                     * Preserve correct MIME type.
                     */
                    contentType:
                        file.type
                }
            );


    if (error) {

        console.error(
            'Image upload failed:',
            error
        );


        throw error;
    }


    /**
     * --------------------------------------------------------
     * GET PUBLIC DISPLAY URL
     * --------------------------------------------------------
     *
     * This works because etu-images is a public bucket.
     */

    const {

        data

    } =
        supabase

            .storage

            .from(
                IMAGE_BUCKET
            )

            .getPublicUrl(
                storagePath
            );


    if (
        !data?.publicUrl
    ) {

        /**
         * Upload succeeded but URL generation failed.
         *
         * Remove the uploaded object so we do not leave an
         * unnecessary orphan.
         */
        await removeImage(
            storagePath
        );


        throw new Error(
            'Image uploaded but its public URL could not be generated.'
        );
    }


    return {

        publicUrl:
            data.publicUrl,

        storagePath
    };
}



/**
 * ============================================================
 * UPLOAD MULTIPLE IMAGES
 * ============================================================
 */


/**
 * uploadImages()
 *
 * Used primarily by the gallery drag/drop feature.
 *
 *
 * files:
 * Array of File objects.
 *
 * folder:
 * Destination folder.
 *
 *
 * Returns:
 *
 * [
 *   {
 *     file,
 *     publicUrl,
 *     storagePath
 *   }
 * ]
 */
export async function uploadImages(

    files,

    folder
) {

    await assertAdmin();


    const fileArray =
        Array.from(
            files || []
        );


    /**
     * Validate EVERY file before uploading any file.
     *
     * This prevents a situation where:
     *
     * image 1 uploads
     * image 2 invalid
     * operation stops halfway
     */
    fileArray.forEach(

        file => {

            validateImageFile(
                file
            );
        }
    );


    const uploaded =
        [];


    try {

        /**
         * Upload sequentially.
         *
         * Gallery is capped at 30 small images, so sequential
         * upload is simple and reliable.
         */
        for (
            const file of fileArray
        ) {

            const result =
                await uploadImage(

                    file,

                    folder
                );


            uploaded.push({

                file,

                ...result
            });
        }


        return uploaded;
    }

    catch (error) {

        /**
         * If one file fails after earlier files uploaded,
         * clean up the successfully uploaded files.
         */
        const paths =
            uploaded.map(

                item =>
                    item.storagePath
            );


        if (
            paths.length > 0
        ) {

            await removeImages(
                paths
            );
        }


        throw error;
    }
}



/**
 * ============================================================
 * DELETE ONE IMAGE
 * ============================================================
 */


/**
 * removeImage()
 *
 * Does nothing when storagePath is null.
 *
 * This is important because external URL images do not belong
 * to Supabase Storage.
 */
export async function removeImage(

    storagePath
) {

    if (!storagePath) {

        return;
    }


    await assertAdmin();


    const {

        error

    } =
        await supabase

            .storage

            .from(
                IMAGE_BUCKET
            )

            .remove([
                storagePath
            ]);


    if (error) {

        console.error(
            'Could not remove image:',
            error
        );


        throw error;
    }
}



/**
 * ============================================================
 * DELETE MULTIPLE IMAGES
 * ============================================================
 */


export async function removeImages(

    storagePaths
) {

    const paths =
        Array.from(
            storagePaths || []
        ).filter(Boolean);


    if (
        paths.length === 0
    ) {

        return;
    }


    await assertAdmin();


    const {

        error

    } =
        await supabase

            .storage

            .from(
                IMAGE_BUCKET
            )

            .remove(
                paths
            );


    if (error) {

        console.error(
            'Could not remove images:',
            error
        );


        throw error;
    }
}