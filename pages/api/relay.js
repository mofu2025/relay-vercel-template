// pages/api/relay.js
// ✅ GPT→Relay→GAS 中継サーバー（Vercelにデプロイ）
// ✅ 2025-11-11：もふGXAユーザーGAS（B1トークン仕様）対応版

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    // GPTからの受信データ
    const { auth, spreadsheetId, post, product, style, format, tags } = req.body;

    if (!auth || !spreadsheetId || !post) {
      throw new Error("auth, spreadsheetId, post が不足しています");
    }

    // GASのWebApp URL（1本のみ）
    const gasUrl =
      "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

    // ✅ GAS改善版に合わせたペイロード構成（7列対応）
    const payload = {
      mode: "post",
      auth,               // B1セルのトークン
      spreadsheetId,      // ユーザーのスプシID
      post,               // 投稿本文（配列 or 文字列）
      product: product || "",
      style: style || "",
      format: format || "",
      tags: tags || []
    };

    // ✅ POST送信
    const gasResp = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = gasResp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const raw = await gasResp.text();
      return res.status(500).json({
        ok: false,
        error: "GASからJSON以外のレスポンス",
        preview: raw.slice(0, 200)
      });
    }

    const result = await gasResp.json();
    res.status(200).json({ ok: true, result });

  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
