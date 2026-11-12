-- Sinkronisasi avg_rating dan review_count semua warung dari tabel REVIEWS.
-- Aplikasi sudah memperbarui kedua kolom ini otomatis setiap review ditambah/dihapus lewat API.
-- Jalankan skrip ini (opsional, aman diulang) bila data REVIEWS pernah diubah langsung di SSMS
-- atau bila nilai awal di STALLS tidak cocok dengan data review.
USE review_kantin;
GO

UPDATE s
SET s.review_count = ISNULL(r.cnt, 0),
    s.avg_rating   = CAST(ISNULL(r.avg_val, 0) AS DECIMAL(3,2))
FROM dbo.STALLS s
LEFT JOIN (
    SELECT stall_id,
           COUNT(*)                        AS cnt,
           AVG(CAST(rating AS DECIMAL(5,2))) AS avg_val
    FROM dbo.REVIEWS
    GROUP BY stall_id
) r ON r.stall_id = s.id;
GO

SELECT id, name, avg_rating, review_count FROM dbo.STALLS ORDER BY id;
GO
