import { createClient } from "@libsql/client";

const client = createClient({
    url: import.meta.env.TURSO_DATABASE_URL ?? "",
    authToken: import.meta.env.TURSO_AUTH_TOKEN ?? ""
});

export const getListContent = async (type: string, lang: string) => {
    const response = await client.execute({
        sql: `SELECT id, date, title, views, url, lang FROM content WHERE type = :type AND lang = :lang`,
        args: {
            type: type,
            lang: lang
        }
    });
    return response.toJSON();
};


export const getBlogPost = async (id: string) => {
    const response = await client.execute({
        sql: `SELECT id, content FROM blog WHERE id = :id`,
        args: {
            id: id
        }
    });
    return response.toJSON();
};

export const getCommentsByBlogPost = async (id: string) => {
    const response = await client.execute({
        sql: `SELECT id, user_name, comment FROM comments WHERE content_id = :id`,
        args: {
            id: id
        }
    });
    return response.toJSON();
}

export const patchView = async (id: string) => {
    const response = await client.execute({
        sql: `UPDATE content SET views = views + 1 WHERE id = :id`,
        args: {
            id: id
        }
    });
    return response.toJSON();
};

export const postComment = async (id: string, user_name: string, comment: string) => {
    const response = await client.execute({
        sql: `INSERT INTO comments (content_id, user_name, comment) VALUES (:id, :user_name, :comment)`,
        args: {
            id: id,
            user_name: user_name,
            comment: comment
        }
    });
    return response.toJSON();
};