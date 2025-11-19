import { GoogleSpreadsheet } from "google-spreadsheet";

export default async function handler(req, res) {
  try {
    const { spreadsheetId, token } = req.body;

    // Registry のシートID（あなたの固定ID）
    const doc = new GoogleSpreadsheet(
      "1lDR7uP5z38KabjDvJ3ZY2tUrp7bfzCwz2lX7v30fEdM"
    );

    // Vercel の環境変数から ServiceAccount 情報を取る
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, "\n"),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["Registry"];

    // 既存チェック
    const rows = await sheet.getRows();
    const exists = rows.some(
      (r) =>
        r.spreadsheetId === spreadsheetId && r.token === token
    );

    // 無ければ追加
    if (!exists) {
      await sheet.addRow({ spreadsheetId, token });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
