/**
 * ============================================================
 * ETU PORTAL - IMAGE CHOICE SERVICE
 * ============================================================
 *
 * PURPOSE:
 *
 * Connects the reusable imagePicker component with the
 * Supabase Storage service.
 *
 * A CMS image field can use:
 *
 * 1. A newly uploaded image
 * 2. An external image URL
 * 3. The currently saved image
 *
 *
 * This service makes that logic reusable for:
 *
 * - Group cover
 * - Group card
 * - Project cover
 * - Gallery media
 *
 * ============================================================
 */


import {

    uploadImage,

    removeImages

} from './storageService.js';


import {

    urlOrPath

} from '../utils/validation.js';



/**
 * ============================================================
 * RESOLVE A SINGLE IMAGE FIELD
 * ============================================================
 *
 * Example:
 *
 * const result = await resolveSingleImageChoice({
 *
 *     picker: groupCoverPicker,
 *
 *     folder: 'groups/ab01/cover',
 *
 *     existingUrl: group.cover_image,
 *
 *     existingStoragePath: group.cover_storage_path,
 *
 *     label: 'Group cover image'
 * });
 *
 *
 * Returns:
 *
 * {
 *     url,
 *     storagePath,
 *     changed,
 *     newUploadPath,
 *     replacedStoragePath
 * }
 */
export async function resolveSingleImageChoice({

    picker,

    folder,

    existingUrl = null,

    existingStoragePath = null,

    label = 'Image'

}) {

    /**
     * Make sure a picker was supplied.
     */
    if (!picker) {

        throw new Error(
            `${label} picker is not available.`
        );
    }


    /**
     * Determine whether administrator selected:
     *
     * upload
     *
     * or
     *
     * URL
     */
    const source =
        picker.getSource();


    /**
     * ========================================================
     * UPLOAD SOURCE
     * ========================================================
     */

    if (
        source === 'upload'
    ) {

        const files =
            picker.getFiles();


        /**
         * Nothing selected.
         *
         * On an EDIT form this means:
         *
         * KEEP THE CURRENT IMAGE.
         *
         * On a CREATE form existingUrl is null, so the result
         * simply remains empty.
         */
        if (
            files.length === 0
        ) {

            return {

                url:
                    existingUrl,

                storagePath:
                    existingStoragePath,

                changed:
                    false,

                newUploadPath:
                    null,

                replacedStoragePath:
                    null
            };
        }


        /**
         * Single-image fields must never contain more than one
         * file.
         *
         * imagePicker already prevents this, but this second
         * check keeps the service safe.
         */
        if (
            files.length > 1
        ) {

            throw new Error(
                `${label} accepts only one image.`
            );
        }


        /**
         * Upload selected image to Supabase Storage.
         */
        const uploaded =
            await uploadImage(

                files[0],

                folder
            );


        return {

            /**
             * Public URL saved in the database.
             */
            url:
                uploaded.publicUrl,


            /**
             * Internal Storage path saved for future deletion.
             */
            storagePath:
                uploaded.storagePath,


            /**
             * Indicates database content should be updated.
             */
            changed:
                true,


            /**
             * If the database operation later fails we can remove
             * this newly uploaded file.
             */
            newUploadPath:
                uploaded.storagePath,


            /**
             * If editing an old uploaded image, this old object
             * can be deleted AFTER the database successfully
             * saves the new image.
             */
            replacedStoragePath:
                existingStoragePath
        };
    }


    /**
     * ========================================================
     * URL SOURCE
     * ========================================================
     */

    if (
        source === 'url'
    ) {

        const rawUrl =
            picker.getUrl();


        /**
         * URL tab selected but nothing entered.
         *
         * Treat this as "keep existing image".
         *
         * This prevents accidental deletion when the user simply
         * switches tabs.
         */
        if (!rawUrl) {

            return {

                url:
                    existingUrl,

                storagePath:
                    existingStoragePath,

                changed:
                    false,

                newUploadPath:
                    null,

                replacedStoragePath:
                    null
            };
        }


        /**
         * Validate URL/path.
         */
        const validUrl =
            urlOrPath(

                rawUrl,

                label
            );


        return {

            /**
             * External image URL is saved directly.
             */
            url:
                validUrl,


            /**
             * External URLs do not belong to our Supabase bucket.
             */
            storagePath:
                null,


            changed:
                true,


            /**
             * Nothing was uploaded in this operation.
             */
            newUploadPath:
                null,


            /**
             * If the previous image was stored in Supabase,
             * remove it AFTER the database update succeeds.
             */
            replacedStoragePath:
                existingStoragePath
        };
    }


    /**
     * Unknown source should never normally occur.
     */
    throw new Error(
        `Unknown image source for ${label}.`
    );
}



/**
 * ============================================================
 * ROLLBACK NEW UPLOADS
 * ============================================================
 *
 * Example:
 *
 * image uploads successfully
 *             ↓
 * database INSERT fails
 *             ↓
 * remove uploaded image again
 *
 *
 * This prevents unused/orphaned files filling Storage.
 */
export async function rollbackNewImageChoices(

    choices = []

) {

    const paths =

        choices

            .map(
                choice =>
                    choice?.newUploadPath
            )

            .filter(Boolean);


    if (
        paths.length === 0
    ) {

        return;
    }


    try {

        await removeImages(
            [
                ...new Set(paths)
            ]
        );
    }

    catch (error) {

        /**
         * Never hide the original database error because cleanup
         * failed.
         */
        console.warn(
            'Could not roll back uploaded images:',
            error
        );
    }
}



/**
 * ============================================================
 * CLEAN UP REPLACED IMAGES
 * ============================================================
 *
 * Run ONLY after the database update succeeded.
 *
 *
 * Example:
 *
 * old:
 * groups/ab01/cover/old.jpg
 *
 * new:
 * groups/ab01/cover/new.jpg
 *
 *
 * Database is updated to new.jpg first.
 *
 * Then old.jpg is deleted from Storage.
 */
export async function cleanupReplacedImageChoices(

    choices = []

) {

    const paths =

        choices

            .filter(
                choice =>
                    choice?.changed
            )

            .map(
                choice =>
                    choice?.replacedStoragePath
            )

            .filter(Boolean);


    if (
        paths.length === 0
    ) {

        return;
    }


    try {

        await removeImages(
            [
                ...new Set(paths)
            ]
        );
    }

    catch (error) {

        /**
         * Database already contains the correct new URL.
         *
         * Therefore a failed cleanup should not make the user
         * think that their update failed.
         *
         * Worst case:
         *
         * an old unused file remains in Storage and can later be
         * cleaned manually.
         */
        console.warn(
            'New image saved, but an old Storage image could not be removed:',
            error
        );
    }
}