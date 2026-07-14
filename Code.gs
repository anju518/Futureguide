/**
 * ระบบแนะแนวการศึกษาและอาชีพ — ตัวรับข้อมูลลง Google Sheets (+ สำรองลง Google Drive)
 * วางโค้ดนี้ใน Apps Script แล้ว Deploy เป็น Web App (Execute as: Me, Access: Anyone)
 */

var SHEET_ID  = '19LsI28Dqf-HVWl_KvfQOdix2CzyRWumSO0Jjbmy-WmM';   // ชีตปลายทาง
var DRIVE_FOLDER_ID = '1XloEdbAkc6djUVuViWqFeaLavEUmXhoJ';          // โฟลเดอร์ Drive สำหรับสำรอง (ตัวเลือก)
var SHEET_NAME = 'Responses';
var SAVE_TO_DRIVE = true;   // ตั้ง false ถ้าไม่ต้องการสำรองไฟล์ลง Drive

var HEADERS = [
  'เวลาบันทึก', 'ชื่อ-สกุล', 'ระดับชั้น', 'GPAX', 'วันที่ประเมิน',
  'พหุปัญญาเด่น (2 อันดับ)', 'คะแนน 9 ด้าน', 'เกรดรายด้าน',
  'อาชีพแนะนำ', 'สาขาแนะนำ', 'มหาวิทยาลัยแนะนำ', 'ความสนใจ', 'ความสามารถ'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    var row = [
      new Date(),
      data.name || '', data.grade || '', data.gpax || '', data.assessedAt || '',
      data.top2 || '', data.scores || '', data.grades || '',
      data.careers || '', data.majors || '', data.universities || '',
      data.interests || '', data.abilities || ''
    ];
    sheet.appendRow(row);

    // สำรองข้อมูลรายคนเป็นไฟล์ JSON ลงโฟลเดอร์ Drive (ตัวเลือก)
    if (SAVE_TO_DRIVE && DRIVE_FOLDER_ID) {
      try {
        var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        var stamp = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd_HH-mm-ss');
        var fname = 'result_' + (data.name || 'unknown') + '_' + stamp + '.json';
        folder.createFile(fname, JSON.stringify(data, null, 2), 'application/json');
      } catch (drErr) { /* ข้ามถ้าเข้าถึงโฟลเดอร์ไม่ได้ */ }
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('ระบบแนะแนวการศึกษาและอาชีพ — Web App พร้อมรับข้อมูล (ใช้ POST)')
    .setMimeType(ContentService.MimeType.TEXT);
}
