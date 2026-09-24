/**
 * ============================================================
 * ETU PORTAL - DATA SERVICE
 * ============================================================
 *
 * Purpose:
 * This is the ONLY service responsible for reading and writing
 * CMS data.
 *
 * Pages and UI components should NOT directly write Supabase
 * queries.
 *
 * Instead they call functions from this service:
 *
 *     getGroups()
 *     getGroupDetails()
 *     createMember()
 *     updateProject()
 *     deleteMedia()
 *     ...
 *
 *
 * DATABASE TABLES USED:
 *
 * groups
 * members
 * projects
 * media
 *
 *
 * IMPORTANT ARCHITECTURE CHANGE:
 *
 * The old supabaseClient.js mixed:
 *
 * - Supabase queries
 * - FALLBACK_DATA
 * - localStorage
 * - formatting
 * - CRUD
 *
 * This new service uses Supabase as the single source of truth.
 * ============================================================
 */

// Shared Supabase connection.
import { supabase } from "./supabase.js";

// Authentication guard used before modifying data.
import { assertAdmin } from "./authService.js";

/**
 * ------------------------------------------------------------
 * throwIfError()
 * ------------------------------------------------------------
 *
 * Small helper used after Supabase requests.
 *
 * If Supabase reports an error, immediately throw it so the
 * calling page can display an appropriate error message.
 */
function throwIfError(error) {
  if (error) {
    throw error;
  }
}

/**
 * ------------------------------------------------------------
 * countByGroup()
 * ------------------------------------------------------------
 *
 * Converts rows such as:
 *
 * [
 *   { group_id: "A" },
 *   { group_id: "A" },
 *   { group_id: "B" }
 * ]
 *
 * into counts:
 *
 * A → 2
 * B → 1
 *
 * Used for:
 *
 * - student counts
 * - project counts
 * - media counts
 */
function countByGroup(rows = []) {
  return rows.reduce(
    (map, row) => {
      map.set(
        row.group_id,

        (map.get(row.group_id) || 0) + 1,
      );

      return map;
    },

    new Map(),
  );
}

/**
 * ------------------------------------------------------------
 * cleanPayload()
 * ------------------------------------------------------------
 *
 * Removes JavaScript values that are undefined.
 *
 * This prevents accidentally sending unwanted undefined
 * properties to Supabase.
 */
function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload)

      .filter(([, value]) => value !== undefined),
  );
}

/**
 * ============================================================
 * READ OPERATIONS
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * getGroups()
 * ------------------------------------------------------------
 *
 * Returns all groups visible to the current user.
 *
 * Public visitor:
 * RLS returns published groups only.
 *
 * Administrator:
 * RLS allows published + unpublished groups.
 *
 *
 * The function also calculates:
 *
 * member_count
 * project_count
 * media_count
 *
 * so GroupCard components do not need separate database calls.
 */
export async function getGroups() {
  /**
   * First retrieve groups.
   */
  const { data: groups, error } = await supabase

    .from("groups")

    .select("*")

    .order("sort_order", {
      ascending: true,
    })

    .order("name", {
      ascending: true,
    });

  throwIfError(error);

  // Nothing else to calculate when there are no groups.
  if (!groups || groups.length === 0) {
    return [];
  }

  /**
   * Store IDs so counts can be retrieved in parallel.
   */
  const groupIds = groups.map((group) => group.id);

  /**
   * Retrieve the related records simultaneously.
   *
   * We only request IDs and group IDs because that is enough
   * for counting.
   */
  const [membersResult, projectsResult, mediaResult] = await Promise.all([
    supabase.from("members").select("id, group_id").in("group_id", groupIds),

    supabase.from("projects").select("id, group_id").in("group_id", groupIds),

    supabase.from("media").select("id, group_id").in("group_id", groupIds),
  ]);

  // Validate all three requests.
  throwIfError(membersResult.error);

  throwIfError(projectsResult.error);

  throwIfError(mediaResult.error);

  // Create fast lookup maps.
  const memberCounts = countByGroup(membersResult.data || []);

  const projectCounts = countByGroup(projectsResult.data || []);

  const mediaCounts = countByGroup(mediaResult.data || []);

  /**
   * Return each group together with calculated counts.
   *
   * Example result:
   *
   * {
   *   id: "...",
   *   name: "Group AB04",
   *   slug: "ab04",
   *   member_count: 28,
   *   project_count: 3,
   *   media_count: 8
   * }
   */
  return groups.map((group) => ({
    ...group,

    member_count: memberCounts.get(group.id) || 0,

    project_count: projectCounts.get(group.id) || 0,

    media_count: mediaCounts.get(group.id) || 0,
  }));
}

/**
 * ------------------------------------------------------------
 * getGroupBySlug()
 * ------------------------------------------------------------
 *
 * Finds one group using its URL slug.
 *
 * Example:
 *
 * group.html?group=ab04
 *
 *        ↓
 *
 * getGroupBySlug('ab04')
 */
export async function getGroupBySlug(slug) {
  const cleanSlug = String(slug || "")
    .trim()
    .toLowerCase();

  const { data, error } = await supabase

    .from("groups")

    .select("*")

    .eq("slug", cleanSlug)

    .maybeSingle();

  throwIfError(error);

  return data || null;
}

/**
 * ------------------------------------------------------------
 * getMembersByGroupId()
 * ------------------------------------------------------------
 *
 * Returns students belonging to one group.
 */
export async function getMembersByGroupId(groupId) {
  const { data, error } = await supabase

    .from("members")

    .select("*")

    .eq("group_id", groupId)

    .order("sort_order", {
      ascending: true,
    })

    .order("created_at", {
      ascending: true,
    });

  throwIfError(error);

  return data || [];
}

/**
 * ------------------------------------------------------------
 * getProjectsByGroupId()
 * ------------------------------------------------------------
 *
 * Returns projects belonging to one group.
 *
 * The optional group argument allows us to attach lightweight
 * group information to each project without requesting it again.
 */
export async function getProjectsByGroupId(
  groupId,

  group = null,
) {
  const { data, error } = await supabase

    .from("projects")

    .select("*")

    .eq("group_id", groupId)

    .order("sort_order", {
      ascending: true,
    })

    .order("created_at", {
      ascending: false,
    });

  throwIfError(error);

  return (data || []).map((project) => ({
    ...project,

    /**
     * The ProjectCard component expects optional
     * related group information.
     */
    groups: group
      ? {
          id: group.id,
          name: group.name,
          slug: group.slug,
        }
      : undefined,
  }));
}

/**
 * ------------------------------------------------------------
 * getMediaByGroupId()
 * ------------------------------------------------------------
 *
 * Loads all gallery/media items belonging to one group.
 */
export async function getMediaByGroupId(groupId) {
  const { data, error } = await supabase

    .from("media")

    .select("*")

    .eq("group_id", groupId)

    .order("sort_order", {
      ascending: true,
    })

    .order("created_at", {
      ascending: false,
    });

  throwIfError(error);

  return data || [];
}

/**
 * ------------------------------------------------------------
 * getGroupDetails()
 * ------------------------------------------------------------
 *
 * Main function used by group.html.
 *
 * It returns everything required by one group page:
 *
 * {
 *     group,
 *     members,
 *     projects,
 *     media
 * }
 */
export async function getGroupDetails(slug) {
  // First find the group itself.
  const group = await getGroupBySlug(slug);

  // Invalid or unavailable group.
  if (!group) {
    return null;
  }

  /**
   * Load related sections in parallel.
   *
   * This is faster than waiting for each request one-by-one.
   */
  const [members, projects, media] = await Promise.all([
    getMembersByGroupId(group.id),

    getProjectsByGroupId(group.id, group),

    getMediaByGroupId(group.id),
  ]);

  return {
    group,

    members,

    projects,

    media,
  };
}

/**
 * ------------------------------------------------------------
 * getAllProjects()
 * ------------------------------------------------------------
 *
 * Loads projects across every group.
 *
 * Used by:
 *
 * - homepage
 * - groups page
 * - categories page
 */
export async function getAllProjects() {
  const { data, error } = await supabase

    .from("projects")

    /**
     * Also load basic group information through the
     * Supabase relationship.
     */
    .select(
      `
            *,
            groups (
                id,
                name,
                slug
            )
        `,
    )

    .order("sort_order", {
      ascending: true,
    })

    .order("created_at", {
      ascending: false,
    });

  throwIfError(error);

  return data || [];
}

/**
 * ------------------------------------------------------------
 * getLatestProjects()
 * ------------------------------------------------------------
 *
 * Returns a small number of projects for the homepage.
 *
 * Featured projects are prioritized first.
 *
 * Within that, newer projects are shown first.
 */
export async function getLatestProjects(limit = 3) {
  const projects = await getAllProjects();

  return projects

    .slice()

    .sort((a, b) => {
      /**
       * Featured projects first.
       */
      if (Boolean(a.is_featured) !== Boolean(b.is_featured)) {
        return Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured));
      }

      /**
       * Then newest first.
       */
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })

    .slice(0, limit);
}

/**
 * ------------------------------------------------------------
 * getSiteStats()
 * ------------------------------------------------------------
 *
 * Calculates homepage statistics.
 *
 * No statistic needs to be hardcoded anymore.
 */
export async function getSiteStats() {
  const groups = await getGroups();

  return {
    groups: groups.length,

    members: groups.reduce((sum, group) => sum + group.member_count, 0),

    projects: groups.reduce((sum, group) => sum + group.project_count, 0),

    media: groups.reduce((sum, group) => sum + group.media_count, 0),
  };
}

/**
 * ============================================================
 * GROUP CRUD
 * ============================================================
 */

/**
 * CREATE group.
 */
export async function createGroup(payload) {
  // Only administrator may write data.
  await assertAdmin();

  const { data, error } = await supabase

    .from("groups")

    .insert(cleanPayload(payload))

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * UPDATE group.
 */
export async function updateGroup(
  id,

  payload,
) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("groups")

    .update(cleanPayload(payload))

    .eq("id", id)

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * DELETE group.
 *
 * Database foreign keys handle:
 *
 * members  → cascade delete
 * projects → cascade delete
 * media    → cascade delete
 */
export async function deleteGroup(id) {
  await assertAdmin();

  const { error } = await supabase

    .from("groups")

    .delete()

    .eq("id", id);

  throwIfError(error);
}

/**
 * ============================================================
 * MEMBER CRUD
 * ============================================================
 */

/**
 * CREATE student/member.
 */
export async function createMember(payload) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("members")

    .insert(cleanPayload(payload))

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * UPDATE student/member.
 */
export async function updateMember(
  id,

  payload,
) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("members")

    .update(cleanPayload(payload))

    .eq("id", id)

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * DELETE student/member.
 */
export async function deleteMember(id) {
  await assertAdmin();

  const { error } = await supabase

    .from("members")

    .delete()

    .eq("id", id);

  throwIfError(error);
}

/**
 * ============================================================
 * PROJECT CRUD
 * ============================================================
 */

/**
 * CREATE project.
 */
export async function createProject(payload) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("projects")

    .insert(cleanPayload(payload))

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * UPDATE project.
 */
export async function updateProject(
  id,

  payload,
) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("projects")

    .update(cleanPayload(payload))

    .eq("id", id)

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * DELETE project.
 *
 * Current foreign key rule:
 *
 * media.project_id
 *      ↓
 * ON DELETE SET NULL
 *
 * Therefore deleting a project keeps related gallery media.
 */
export async function deleteProject(id) {
  await assertAdmin();

  const { error } = await supabase

    .from("projects")

    .delete()

    .eq("id", id);

  throwIfError(error);
}

/**
 * ============================================================
 * MEDIA CRUD
 * ============================================================
 */

/**
 * CREATE gallery media.
 */
export async function createMedia(payload) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("media")

    .insert(cleanPayload(payload))

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * ============================================================
 * CREATE MULTIPLE MEDIA RECORDS
 * ============================================================
 *
 * PURPOSE:
 *
 * Used by the Gallery multi-upload feature.
 *
 * Instead of:
 *
 * image 1 → INSERT
 * image 2 → INSERT
 * image 3 → INSERT
 *
 * we send:
 *
 * [image 1, image 2, image 3]
 *
 * in one database operation.
 *
 *
 * This makes batch gallery uploads easier to manage and gives
 * us one clear success/failure point.
 */
export async function createMediaBatch(records = []) {
  /**
   * Every database write requires administrator access.
   */
  await assertAdmin();

  /**
   * Nothing to insert.
   */
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  /**
   * Remove undefined values using the same helper already
   * used by the other CRUD functions.
   */
  const payload = records.map((record) => cleanPayload(record));

  const {
    data,

    error,
  } = await supabase.from("media").insert(payload).select();

  if (error) {
    console.error("Could not create gallery media batch:", error);

    throw error;
  }

  return data || [];
}

/**
 * UPDATE gallery media.
 */
export async function updateMedia(
  id,

  payload,
) {
  await assertAdmin();

  const { data, error } = await supabase

    .from("media")

    .update(cleanPayload(payload))

    .eq("id", id)

    .select()

    .single();

  throwIfError(error);

  return data;
}

/**
 * DELETE gallery media.
 */
export async function deleteMedia(id) {
  await assertAdmin();

  const { error } = await supabase

    .from("media")

    .delete()

    .eq("id", id);

  throwIfError(error);
}
