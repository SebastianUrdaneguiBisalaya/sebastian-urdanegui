import { createClient } from "@libsql/client";

const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL ?? "",
  authToken: import.meta.env.TURSO_AUTH_TOKEN ?? "",
});

export const getListContent = async (type: string, lang: string) => {
  let query;
  if (lang === "en") {
    query = `
            SELECT A.id, A.date, A.title_en AS title, A.description_en AS description, A.views, A.url, A.entity
            FROM content A
            WHERE type = :type 
            GROUP BY A.id, A.date, A.title_en, A.views, A.url, A.entity
            ORDER BY A.date DESC
        `;
  } else {
    query = `
            SELECT A.id, A.date, A.title AS title, A.description AS description, A.views, A.url, A.entity
            FROM content A
            WHERE type = :type
            GROUP BY A.id, A.date, A.title_en, A.views, A.url, A.entity
            ORDER BY A.date DESC
        `;
  }
  const response = await client.execute({
    sql: query,
    args: {
      type: type,
    },
  });
  return response.rows;
};

export const patchView = async (id: string) => {
  await client.execute({
    sql: `UPDATE content SET views = views + 1 WHERE id = :id`,
    args: {
      id: id,
    },
  });
};
