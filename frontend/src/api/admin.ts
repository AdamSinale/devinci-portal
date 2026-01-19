import { http } from "./http";

type Row = Record<string, any>;

export type AdminRowsResult = {
  items: Row[];
  columns: string[];
  primary_key: string[];
  total: number;
  limit: number;
  offset: number;
};

type EntityRegistryItem = {
  label: string;
  // endpoints
  list: (limit: number, offset: number) => Promise<Row[]>;
  create: (payload: Row) => Promise<any>;
  update: (rowId: string, payload: Row) => Promise<any>;
  remove: (rowId: string) => Promise<any>;

  // pk metadata for AdminPage (to build row ids)
  primary_key: string[];

  // optional: fixed columns ordering
  columns?: string[];

  // optional: ability flags (אם תרצה בהמשך לכבות Add/Delete לישות מסוימת)
  canCreate?: boolean;
  canDelete?: boolean;
};

function inferColumns(items: Row[], preferred?: string[]) {
  if (preferred && preferred.length) return preferred;

  const set = new Set<string>();
  for (const it of items) {
    for (const k of Object.keys(it)) set.add(k);
  }
  // סדר יציב: לפי הופעה ראשונה באייטם הראשון, ואז שאר
  const first = items[0] ? Object.keys(items[0]) : [];
  const rest = [...set].filter((k) => !first.includes(k)).sort();
  return [...first, ...rest];
}

// rowId format: "a:b" (כמו שהיה לך באדמין הישן)
function splitRowId(rowId: string) {
  return rowId.split(":").map((x) => decodeURIComponent(x));
}

function enc(v: any) {
  return encodeURIComponent(String(v));
}

/**
 * Registry: כאן אתה מחבר "entity name" (מה שרואים ב-Select)
 * לאנדפוינטים החדשים שלך.
 *
 * אם אצלך שם route שונה -> עדכן רק כאן.
 */
const ENTITY_REGISTRY: Record<string, EntityRegistryItem> = {
  // USERS
  users: {
    label: "users",
    primary_key: ["t_name"],
    list: async (_limit, _offset) => (await http.get<Row[]>("/users")).data,
    create: async (payload) => (await http.post("/users", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/users/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/users/${enc(rowId)}`)).data,
  },

  // TEAMS
  teams: {
    label: "teams",
    primary_key: ["name"],
    list: async () => (await http.get<Row[]>("/teams")).data,
    create: async (payload) => (await http.post("/teams", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/teams/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/teams/${enc(rowId)}`)).data,
  },

  // ROLES
  roles: {
    label: "roles",
    primary_key: ["name"],
    list: async () => (await http.get<Row[]>("/roles")).data,
    create: async (payload) => (await http.post("/roles", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/roles/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/roles/${enc(rowId)}`)).data,
  },

  // MESSAGES
  messages: {
    label: "messages",
    primary_key: ["id"],
    list: async () => (await http.get<Row[]>("/messages")).data,
    create: async (payload) => (await http.post("/messages", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/messages/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/messages/${enc(rowId)}`)).data,
  },

  // USER_EVENTS
  user_events: {
    label: "user_events",
    primary_key: ["id"],
    list: async () => (await http.get<Row[]>("/user-events")).data,
    create: async (payload) => (await http.post("/user-events", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/user-events/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/user-events/${enc(rowId)}`)).data,
  },

  // TEAM_LINKS
  team_links: {
    label: "team_links",
    primary_key: ["id"],
    list: async () => (await http.get<Row[]>("/team-links")).data,
    create: async (payload) => (await http.post("/team-links", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/team-links/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/team-links/${enc(rowId)}`)).data,
  },

  // FORUM_IDEAS
  forum_ideas: {
    label: "forum_ideas",
    primary_key: ["id"],
    list: async () => (await http.get<Row[]>("/forum-ideas")).data,
    create: async (payload) => (await http.post("/forum-ideas", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/forum-ideas/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/forum-ideas/${enc(rowId)}`)).data,
  },

  // FORUM_EVENTS
  forum_events: {
    label: "forum_events",
    primary_key: ["id"],
    list: async () => (await http.get<Row[]>("/forum-events")).data,
    create: async (payload) => (await http.post("/forum-events", payload)).data,
    update: async (rowId, payload) => (await http.patch(`/forum-events/${enc(rowId)}`, payload)).data,
    remove: async (rowId) => (await http.delete(`/forum-events/${enc(rowId)}`)).data,
  },

  // USER_ROLES (Composite PK: user + role)
  user_roles: {
    label: "user_roles",
    primary_key: ["user_t_name", "role_name"],

    list: async () => (await http.get<Row[]>("/user-roles")).data,

    create: async (payload) => (await http.post("/user-roles", payload)).data,

    update: async (rowId, payload) => {
      const [user_t_name, role_name] = splitRowId(rowId);
      // אם אצלך update נעשה לפי שני פרמטרים ב-path, זה המבנה הנפוץ:
      return (await http.patch(`/user-roles/${enc(user_t_name)}/${enc(role_name)}`, payload)).data;
    },

    remove: async (rowId) => {
      const [user_t_name, role_name] = splitRowId(rowId);
      return (await http.delete(`/user-roles/${enc(user_t_name)}/${enc(role_name)}`)).data;
    },
  },

  // FORUM_SETTINGS (Singleton) — נשמרת אותה פונקציונליות של "עריכה", אבל בלי admin router
  forum_settings: {
    label: "forum_settings",
    // PK פיקטיבי כדי לאפשר Edit/Delete UI זהה (ואדמין יוכל לערוך).
    // Delete/Create אצל Singleton בדרך כלל לא קיים, אז נחסום אותם למטה.
    primary_key: ["__id"],
    columns: ["__id"], // נוסיף עוד בעזרת infer

    list: async () => {
      const obj = (await http.get<Row>("/forum-settings")).data;
      // הופכים ל"רשימת שורות" כדי שהטבלה תישאר זהה
      return [{ __id: "1", ...obj }];
    },

    canCreate: false,
    canDelete: false,

    create: async () => {
      throw new Error("forum_settings is singleton (create disabled)");
    },

    update: async (_rowId, payload) => {
      // AdminPage כבר מסיר PK מה-payload, אז __id לא ישלח.
      return (await http.patch("/forum-settings", payload)).data;
    },

    remove: async () => {
      throw new Error("forum_settings is singleton (delete disabled)");
    },
  },
};

function getEntity(entity: string): EntityRegistryItem {
  const e = ENTITY_REGISTRY[entity];
  if (!e) throw new Error(`Unknown entity: ${entity}`);
  return e;
}

export async function getAdminEntities(): Promise<string[]> {
  // אותו “Entities list” שהיה קודם – אבל בלי backend endpoint
  return Object.keys(ENTITY_REGISTRY);
}

export async function getAdminRows(entity: string, limit = 50, offset = 0): Promise<AdminRowsResult> {
  const e = getEntity(entity);
  const items = await e.list(limit, offset);

  const cols = inferColumns(items, e.columns);
  const columns =
    entity === "forum_settings"
      ? // forum_settings: נשמור __id ראשון כדי שהPK הפיקטיבי לא ייתקע באמצע
        ["__id", ...cols.filter((c) => c !== "__id")]
      : cols;

  const total = items.length;

  return {
    items,
    columns,
    primary_key: e.primary_key,
    total,
    limit,
    offset,
  };
}

export async function createAdminRow(entity: string, payload: Row) {
  const e = getEntity(entity);
  if (e.canCreate === false) throw new Error("Create disabled for this entity");
  return await e.create(payload);
}

export async function updateAdminRow(entity: string, rowId: string, payload: Row) {
  const e = getEntity(entity);
  return await e.update(rowId, payload);
}

export async function deleteAdminRow(entity: string, rowId: string) {
  const e = getEntity(entity);
  if (e.canDelete === false) throw new Error("Delete disabled for this entity");
  return await e.remove(rowId);
}
