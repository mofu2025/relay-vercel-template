// ✅ GPT→Relay→GAS 中継サーバー（Vercel版）
// ✅ 2025-11-12 修正版：Next.js 構成対応

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { auth, spreadsheetId, post, product, style, format, tags } = req.body;

    if (!auth || !spreadsheetId || !post) {
      throw new Error("auth, spreadsheetId, post が不足しています");
    }

    const gasUrl =
      "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

    const payload = {
      mode: "post",
      auth,
      spreadsheetId,
      post,
      product: product || "",
      style: style || "",
      format: format || "",
      tags: tags || [],
    };

    const gasResp = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = gasResp.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const result = isJson ? await gasResp.json() : await gasResp.text();

    res.status(200).json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
