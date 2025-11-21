import { GoogleSpreadsheet } from "google-spreadsheet";

export default async function handler(req, res) {
  try {
    // ★ 最重要：req.body は undefined なので自分で JSON を解析
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body || {};

    const { spreadsheetId, token } = body;

    if (!spreadsheetId || !token) {
      return res.status(400).json({
        ok: false,
        error: "spreadsheetId または token が未送信です"
      });
    }

    const doc = new GoogleSpreadsheet(
      "1lDR7uP5z38KabjDvJ3ZY2tUrp7bfzCwz2lX7v30fEdM"
    );

    // ★ private_key の改行置換を修正（\\n → \n）
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["Registry"];

    const rows = await sheet.getRows();
    const exists = rows.some(
      r => r.spreadsheetId === spreadsheetId && r.token === token
    );

    if (!exists) {
      await sheet.addRow({ spreadsheetId, token });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
