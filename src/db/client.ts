import { createClient } from "@libsql/client";

const client = createClient({
    url: import.meta.env.TURSO_DATABASE_URL ?? "",
    authToken: import.meta.env.TURSO_AUTH_TOKEN ?? ""
});

export const getListContent = async (type: string, lang: string) => {
    let query;
    if (lang === "en") {
        query = `SELECT id, date, title_en AS title, views, url, entity FROM content WHERE type = :type ORDER BY date DESC`
    } else {
        query = `SELECT id, date, title, views, url, entity FROM content WHERE type = :type ORDER BY date DESC`
    }
    const response = await client.execute({
        sql: query,
        args: {
            type: type,
        }
    });
    return response.rows;
};


export const getBlogPost = async (id: string, lang: string) => {
    let query;
    if (lang === "en") {
        query = `
            SELECT A.id, A.content_en, A.author, B.date, B.title_en, B.views
            FROM blog A
            LEFT JOIN content B ON A.content_id = B.id
            WHERE id = :id
        `
    }
    else {
        query = `
            SELECT A.id, A.content, A.author, B.date, B.title, B.views
            FROM blog A
            LEFT JOIN content B ON A.content_id = B.id
            WHERE id = :id
        `
    }
    const response = await client.execute({
        sql: query,
        args: {
            id: id
        }
    });
    return response.rows;
};

export const getCommentsByBlogPost = async (id: string) => {
    const response = await client.execute({
        sql: `SELECT id, user_name, comment FROM comments WHERE content_id = :id`,
        args: {
            id: id
        }
    });
    return response.rows;
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