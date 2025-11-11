// pages/api/relay.js
// ✅ GPT→Relay→GAS 中継サーバー（Vercelにデプロイ）
// ✅ 2025-11-12: spreadsheetId 自動補完対応版（B1トークン仕様対応）

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    let { auth, spreadsheetId, post, product, style, format, tags } = req.body;

    // ✅ spreadsheetId が未指定なら GAS から自動取得
    if (!spreadsheetId || spreadsheetId === "undefined") {
      const tokenResp = await fetch(
        "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec"
      );
      const tokenJson = await tokenResp.json();
      spreadsheetId = tokenJson.userId || "";
      console.log("🔁 自動取得: spreadsheetId =", spreadsheetId);
    }

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
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = gasResp.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await gasResp.json()
      : await gasResp.text();

    res.status(200).json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
