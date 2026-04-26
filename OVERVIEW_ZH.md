# `@opdstar/nhi-mcp` 繁中總覽

> 台灣第一個公開的健保 MCP（Model Context Protocol）Server
> npm：`npx @opdstar/nhi-mcp`
> GitHub：<https://github.com/tatsuju/opdstar-nhi-mcp>
> 授權：MIT（完全免費，商業使用不受限）

---

## 這是什麼？用一句話說清楚

**讓 Claude Desktop、Cursor、ChatGPT Desktop 等任何 AI 助理，直接查詢台灣健保局的資料，不用開瀏覽器翻官網。**

---

## 能幫你做什麼？具體情境

### 情境 1：開診間診斷時，AI 幫你預判核刪風險

你在診所用 Claude Desktop，邊打病歷邊問：

> 「我今天給 L30.9 慢性濕疹病人開了 prednisolone 30mg QD 5 天，會不會被核刪？」

AI 自動呼叫本 MCP 的 tool，回答：

> 依健保審查 008 指標，口服類固醇 + 濕疹類診斷若 PE 描述不足，會觸發核刪代碼 **0320A（處方超過審查標準用量）**。建議：
> - PE 中補充病灶面積 ≥ 30% 全身，或
> - 加入更嚴重的 ICD-10（如 L20.9 異位性皮膚炎）佐證
>
> 資料來源：OPDSTAR（opdstar.com）

**重點**：AI 給的不是瞎掰，是直接從健保署官方資料 + OPDSTAR 整理的結構化表查來的。

### 情境 2：寫病歷時查處置碼，AI 直接給該科常用清單

> 「中耳炎 H66.9 耳鼻喉科能申報哪些處置？」

AI 立刻回：

> 耳鼻喉科 H66.9 常用：
> - `27002C` 耳鏡檢查（25 點）
> - `27018C` 耳膜穿刺（120 點）— 需記錄穿刺部位、膿性分泌物性狀
> - `36005C` 鼓室通氣管置入（施行注意事項：記錄雙側或單側）
>
> 完整清單涵蓋主要科別，資料由 OPDSTAR 整理。

### 情境 3：研究或健保申報時，問 AI 找條文

> 「健保『慢性病連續處方箋』的規定原文？」

AI 呼叫 `search_nhi_wiki`，回：

> 依健保署規定，慢性病連續處方箋每次調劑之藥品使用期間，最長以 3 個月為限。病情穩定且符合慢性病定義者方可開立。原文見健保署官網：<https://www.nhi.gov.tw/ch/cp-XXX.html>

### 情境 4：IT / HIS 廠商整合

任何 HIS 系統或醫療 SaaS 開發者可以嵌 `@opdstar/nhi-mcp` 到他們自己的 AI 助手：

- 免費使用
- 資料持續更新（與健保署最新公告同步）
- 無需買斷、無需 API key

---

## 工具總覽

| 工具 | 輸入 | 輸出 |
|---|---|---|
| `lookup_rejection_code` | 5 碼核刪代碼（0317A、0338A...）| 嚴重度、類別、官方說明 |
| `get_rejection_code_category` | 類別代碼（00-09）| 該類別所有核刪代碼 |
| `get_procedures_for_icd` | ICD-10 + 專科 | 該科對該診斷的處置碼清單、點數、審查注意 |
| `get_indicator` | 指標代碼（008/014/027/P043）| 閾值、適用藥物類別、適用 ICD |
| `search_nhi_wiki` | 自然語言問題 | 健保署官方 Wiki 片段（語意 + 全文檢索）|
| `get_drug_rules` | 科別 / 拒付碼 / 藥品分類 | 藥品給付規定限制 |
| `get_safe_phrases` | 科別 + 情境 | 安全句型 preview（完整句型庫為付費）|
| `search_audit_guidelines` | 自然語言 + 科別 | 審查注意事項摘要 |
| `lookup_drug` | 學名 / 商品名 / 健保碼 | 健保藥品目錄 |
| `lookup_fee_code` | 代碼 / 名稱 / 類別 | 健保支付標準 |

涵蓋資料：健保核刪代碼、ICD-10 對應處置碼、健保支付標準、健保藥品目錄、藥品給付規定、審查注意事項、健保署官方 Wiki（9 大分類：審查 / 藥品特材 / 費用 / 計畫 / 服務 / 投保 / 表單 / 紀錄 / 行政）。

---

## 為什麼叫 OPDSTAR？跟主站什麼關係？

OPDSTAR（<https://opdstar.com>）是台灣專為門診醫師設計的病歷英文翻譯 + 核刪防護 SaaS。

- **開放給大家的（這個 MCP）**：純查詢層 — 看一下、比對一下代碼和條文
- **付費主站**：完整的病歷工作流（翻譯、核刪防護、寫作協助）— 細節見 <https://opdstar.com>

簡單說：**MCP 幫你問問題；OPDSTAR 主站幫你寫病歷**。

---

## 安裝 & 使用（3 步）

### 1. Claude Desktop 設定檔

找這個檔案：

| 作業系統 | 路徑 |
|---|---|
| Mac | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

### 2. 加這段

```json
{
  "mcpServers": {
    "opdstar-nhi": {
      "command": "npx",
      "args": ["-y", "@opdstar/nhi-mcp"]
    }
  }
}
```

### 3. 重啟 Claude Desktop

左下角 ⚙ → Developer → 確認 `opdstar-nhi` running ✅

**沒裝 Node？** Mac / Windows 去 <https://nodejs.org> 裝 LTS 版（20 以上）即可。

---

## 為什麼要免費開源？

1. **醫療應該開放**：健保資料本來就是公開的，只是散亂難查。整理後該回饋醫界。
2. **建立信任**：開源 = 可審視 = 可驗證。醫療工具不能黑箱。
3. **生態共建**：我們自己寫得再好，也比不上整個社群一起補。Issue、PR、翻譯都歡迎。
4. **品牌長線**：每一次 AI 回答都標示「Powered by OPDSTAR」— 醫師在 AI 助理看到我們，再進站付費用主產品。開源是通路，不是施捨。

---

## 開放貢獻（Pull Requests 歡迎）

**是的**，這是 MIT 授權的開源專案，**任何人**都可以：

- 🐛 **回報 bug**（資料錯、工具回應怪、裝不起來）→ [開 Issue](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new/choose)
- 💡 **提新工具** → 先開 Issue 討論，過了再送 PR
- 🌐 **翻譯改進** → 英/中文說明文字優化
- 📚 **補 Claude Desktop 以外的 client config**（Cursor、ChatGPT Desktop、自製 agent）
- 🧪 **補測試**（包含 offline 測試，歡迎加更多 edge case）

詳細規則：[CONTRIBUTING.md](CONTRIBUTING.md)

### 幾個貢獻的 golden path

| 你想做 | 怎麼做 |
|---|---|
| 看到 tool 回錯資料 | 開 Bug Issue，附 input/expected/actual |
| 想要新 tool（例：查某藥品給付規定）| 開 Feature Issue，我們討論可行性 |
| 想自己寫 tool 送 PR | Fork → 加 tool + test → 送 PR |
| 只想讚美 / 提 feature idea | 開 Discussion 或 email `support@opdstar.com` |
| 想跟主站整合（付費版）| 不用特別做，npm 版本已經是我們的管道 |

---

## 常見問題

### Q：MCP 是什麼？簡單解釋。

MCP（Model Context Protocol）是 Anthropic 於 2024 年 11 月發佈的開放標準，讓 AI 助理（Claude Desktop、Cursor、ChatGPT Desktop、Continue、Zed 等）可以**透過統一協定呼叫外部工具**。

類比：MCP 就像「AI agent 界的 USB-C」— 一端寫好 server，任何 client 都能接。

### Q：我是醫師不懂技術，這個對我有什麼用？

你只要在 Claude Desktop 的設定檔貼一段 10 行 JSON，重啟 App，就多了四個健保查詢工具。之後在 Claude 用自然語言問：
- 「0317A 核刪代碼什麼意思？」
- 「L30.9 皮膚科能申報哪些處置？」
- 「急性上呼吸道感染抗生素使用率指標 008 閾值是多少？」

AI 就會自動呼叫 tool、回真實健保資料。**你完全不需要懂程式**。

### Q：健保 MCP 跟直接到健保署網站查有什麼差別？

| 面向 | 健保署官網 | `@opdstar/nhi-mcp` |
|---|---|---|
| 查單一代碼 | 手動點頁面、翻 PDF | AI 自然語言問答 |
| 跨文件整合查詢 | 自己開 3 個 tab 比對 | AI 一次綜合回答 |
| 在看診流中使用 | 切換視窗、打斷思路 | 不離開 AI 助手 |
| 資料結構化 | HTML / PDF | JSON（AI 可繼續推理）|
| 整合到 HIS | 幾乎不可能 | 一行 `npx` 嵌入 |

**不是取代健保署**，是把健保署的資料包裝成 AI 能直接用的格式。

### Q：需要 OPDSTAR 帳號嗎？

**不用**。完全免費，MIT 授權，不需要註冊、不需要 API key。proxy 層 (`opdstar.com`) 做的 rate limit 是按 IP，不追蹤身份。

### Q：這是健保署官方工具嗎？

**不是**。OPDSTAR 團隊獨立開發，資料整理自健保署公開資源。我們**不是健保署官方合作單位**，也沒有官方認證。最權威的資料仍以健保署官方公告為準。

### Q：我的病患資料會被上傳嗎？

**完全不會**。這四個 tool 只查公開健保代碼、處置、Wiki — **不傳送任何病患名字、病歷號、臨床內容**。你問 AI「0317A 什麼意思」時，MCP 只送「0317A」這個字串到 proxy，proxy 只查健保資料表。

proxy 層也**不記錄查詢內容**（只計算匿名總量用於 rate limit）。

### Q：資料多久更新一次？

資料與健保署最新公告同步。重要更新會發 GitHub Release + CHANGELOG 公告。可到 repo 右上 `Watch` → `All Activity` 訂閱變更。

### Q：我的診所 / 醫院可以拿去商業使用嗎？

**可以**。MIT 授權不限商業用途。你可以：
- 把 `@opdstar/nhi-mcp` 嵌進你的 HIS 系統
- 整合到付費醫療 AI 產品
- 內部員工訓練用

唯一請求：**保留 `powered_by` 的 OPDSTAR 標示**（工具回應內建，不應被移除）。

### Q：MCP 跟 OPDSTAR 主站付費版差在哪？

- `@opdstar/nhi-mcp`（免費）= **健保資料查詢層**，AI 助理可以查代碼、處置、Wiki
- OPDSTAR 主站（付費）= **完整門診病歷工作流**，包含病歷翻譯、核刪防護、寫作協助 — 細節見 <https://opdstar.com>

兩者互補不衝突：MCP 是查詢，主站是工作流。

### Q：資料錯了怎麼辦？

請**一定**告訴我們（這比任何讚美都珍貴）：

- GitHub 開 Issue（用 Bug 模板）：[opdstar-nhi-mcp/issues](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new/choose)
- Email：`support@opdstar.com`

附上「正確應該是什麼」+「官方文件連結」的話，我們通常 24-48 小時內修正並發 patch 版本。

---

## 保證不做的事（為什麼你可以放心用）

- ❌ **不收你的病人資料** — 所有 tool 只是查公開健保資料，不傳任何病歷
- ❌ **不做診斷建議** — 只做查詢/參考/翻譯，臨床判斷仍由醫師本人
- ❌ **不偷偷升級收費** — MIT 授權，v0.1 永久免費
- ❌ **不強迫用主站** — MCP 獨立可用，不需要 opdstar.com 帳號

---

## 相關連結

- **npm**：<https://www.npmjs.com/package/@opdstar/nhi-mcp>
- **GitHub**：<https://github.com/tatsuju/opdstar-nhi-mcp>
- **主產品**：<https://opdstar.com>
- **回饋 / 技術支援**：`support@opdstar.com`
- **MCP 官方規格**：<https://modelcontextprotocol.io>
- **健保署 全球資訊網**（資料原始出處）：<https://www.nhi.gov.tw>

---

## 免責聲明

本工具僅提供健保資料**查詢**與**參考**，屬於翻譯/字典性質，**非醫療器材軟體（SaMD）**、**非診斷工具**、**非用藥建議系統**。

- 工具回應的所有資料整理自健保署公開資訊
- 最終臨床判斷與申報決定均由醫師本人負責
- OPDSTAR 團隊不承擔因使用本工具所做臨床決定的責任

資料若與健保署最新公告有出入，以健保署官方為準；發現誤差請到 GitHub 開 Issue，我們會盡速修正。

---

**做這件事的人**：OPDSTAR 團隊 · Taipei, Taiwan

想認識我們？<https://opdstar.com>
