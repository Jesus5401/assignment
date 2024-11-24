const express = require('express');
const db = require('../db');
const multer = require('multer');
const ExcelJS = require('exceljs');
const router = express.Router();

// 获取联系人列表
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM contacts';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            res.json(results);
        }
    });
});

// 添加联系人
router.post('/', (req, res) => {
    const { name, phone, email } = req.body;
    const sql = 'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)';
    db.query(sql, [name, phone, email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database insertion error');
        } else {
            res.json({ id: result.insertId });
        }
    });
});

// 删除联系人
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM contacts WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database deletion error');
        } else {
            res.sendStatus(200);
        }
    });
});

// 收藏/取消收藏联系人
router.put('/:id/favorite', (req, res) => {
    const { id } = req.params;
    const sql = `
        UPDATE contacts 
        SET is_favorite = CASE 
            WHEN is_favorite = 1 THEN 0 
            ELSE 1 
        END
        WHERE id = ?`;
    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database update error');
        } else {
            res.sendStatus(200);
        }
    });
});

// 导出联系人到 Excel
router.get('/export', async (req, res) => {
    const sql = 'SELECT * FROM contacts';
    db.query(sql, async (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query error');
        } else {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Contacts');

            sheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Favorite', key: 'is_favorite', width: 10 },
            ];

            sheet.addRows(results);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="contacts.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        }
    });
});

// 导入联系人从 Excel 文件
const upload = multer({ dest: 'uploads/' });
router.post('/import', upload.single('file'), async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const sheet = workbook.getWorksheet('Contacts');
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            rows.push({
                name: row.getCell(2).value,
                phone: row.getCell(3).value,
                email: row.getCell(4).value,
                is_favorite: row.getCell(5).value ? 1 : 0,
            });
        }
    });

    rows.forEach(row => {
        const sql = 'INSERT INTO contacts (name, phone, email, is_favorite) VALUES (?, ?, ?, ?)';
        db.query(sql, [row.name, row.phone, row.email, row.is_favorite], (err) => {
            if (err) console.error(err);
        });
    });

    res.send('Contacts imported successfully');
});

module.exports = router;
