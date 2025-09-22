import { createClient } from "@libsql/client";

const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL ?? "",
  authToken: import.meta.env.TURSO_AUTH_TOKEN ?? "",
});

export const getListContent = async (type: string, lang: string) => {
  let query;
  if (lang === "en") {
    query = `
            SELECT A.id, A.date, A.title_en AS title, A.description_en AS description, A.views, A.url, A.entity, COALESCE(COUNT(B.id), 0) AS comments
            FROM content A
            LEFT JOIN comments B ON A.id = B.content_id
            WHERE type = :type 
            GROUP BY A.id, A.date, A.title_en, A.views, A.url, A.entity
            ORDER BY A.date DESC
        `;
  } else {
    query = `
            SELECT A.id, A.date, A.title AS title, A.description AS description, A.views, A.url, A.entity, COALESCE(COUNT(B.id), 0) AS comments
            FROM content A
            LEFT JOIN comments B ON A.id = B.content_id
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

export const getCommentsByBlogPost = async (id: string) => {
  const response = await client.execute({
    sql: `SELECT id, user_name, comment FROM comments WHERE content_id = :id`,
    args: {
      id: id,
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

export const postComment = async (
  id: string,
  user_name: string,
  comment: string
) => {
  await client.execute({
    sql: `INSERT INTO comments (content_id, user_name, comment) VALUES (:id, :user_name, :comment)`,
    args: {
      id: id,
      user_name: user_name,
      comment: comment,
    },
  });
};
