import ejs from 'ejs';
import path from 'path';

export async function renderModuleView(viewPath: string, data: Record<string, any>) {
    // 1. Render file view spesifik dari dalam modul (misal: modules/user/views/index.ejs)
    const normalizedViewPath = viewPath.endsWith('.ejs') ? viewPath : `${viewPath}.ejs`;
    const absolutePagePath = path.resolve(import.meta.dir, '../modules', normalizedViewPath);
    const bodyContent = await ejs.renderFile(absolutePagePath, data);

    // 2. Render layout utama global dengan menyisipkan bodyContent
    const layoutPath = path.join(import.meta.dir, '../views/layouts/main.ejs');
    const finalHtml = await ejs.renderFile(layoutPath, {
        ...data,
        body: bodyContent
    });

    return new Response(finalHtml, {
        headers: { 'Content-Type': 'text/html' }
    });
}