// Quiz Maker results backend (Google Apps Script).
// 1. Create a Google Sheet. 2. Extensions > Apps Script. 3. Paste this file. 4. Change ADMIN_KEY.
// 5. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone. 6. Copy the web app URL into site.js (api).
var ADMIN_KEY = "CHANGE_ME_SECRET";

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName("Results");
  if (!s) { s = ss.insertSheet("Results"); s.appendRow(["Time","QuizID","Title","Channel","Name","Score","Total","Points","Percent","Seconds"]); }
  return s;
}
function clean_(v, n) { return String(v || "").slice(0, n).replace(/^[=+\-@]/, "'$&"); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  sheet_().appendRow([new Date(), clean_(d.id,20), clean_(d.title,100), clean_(d.channel,60), clean_(d.name,40),
    Number(d.score)||0, Number(d.total)||0, Number(d.pts)||0, Number(d.pct)||0, Number(d.sec)||0]);
  return out_({ ok: 1 });
}
function rows_() {
  var v = sheet_().getDataRange().getValues(); v.shift();
  return v.map(function (r) { return { t: r[0], id: String(r[1]), title: r[2], channel: r[3], name: r[4], score: r[5], total: r[6], pts: r[7], pct: r[8], sec: r[9] }; });
}
function doGet(e) {
  var p = e.parameter || {}, r = rows_();
  if (p.action === "all") { if (p.key !== ADMIN_KEY) return out_({ error: "bad key" }); return out_({ rows: r }); }
  var q = r.filter(function (x) { return x.id === p.quiz; });
  q.sort(function (a, b) { return b.pts - a.pts || a.sec - b.sec; });
  return out_({ count: q.length, top: q.slice(0, 10).map(function (x) { return { name: x.name, score: x.score, total: x.total, pts: x.pts, t: x.t }; }) });
}
