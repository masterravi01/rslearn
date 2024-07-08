export const DB_NAME = "masterhub";
export const CLOUD_AVATAR_FOLDER_NAME = "jspAvatar";
export const CLOUD_COVERPIC_FOLDER_NAME = "jspCoverImage";
export const CLOUD_THUMBNAIL_FOLDER_NAME = "jspThumbnail";
export const CLOUD_VIDEO_FOLDER_NAME = "jspVideo";

/**
 * @type {{ ADMIN: "admin"; USER: "user";} as const}
 */
export const UserRolesEnum = {
  ADMIN: "admin",
  USER: "user",
};
export const AvailableUserRolesEnum = Object.values(UserRolesEnum);
