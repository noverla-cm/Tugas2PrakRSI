-- Seed lengkap 7 tabel. Aman dijalankan ulang DAN aman untuk database lama (idempotent per baris):
-- setiap baris seed disisipkan hanya bila belum ada (cocok id, email/pasangan unik) dan induk
-- foreign key-nya ada. Tabel yang sudah terisi sebagian akan dilengkapi, bukan dilewati seluruhnya.
-- Data lama tidak diubah atau dihapus. Jumlah baris yang ditambahkan ditampilkan lewat PRINT.
USE review_kantin;
GO

-- USERS
SET IDENTITY_INSERT dbo.USERS ON;

INSERT INTO dbo.USERS (id, name, email, password_hash, role)
SELECT v.id, v.name, v.email, v.password_hash, v.role
FROM (VALUES
        (1,  N'Admin Kantin', N'admin@kantin.test',   N'hash_admin',  N'admin'),
        (2,  N'Bu Tini',      N'tini@kantin.test',    N'hash_owner1', N'owner'),
        (3,  N'Pak Slamet',   N'slamet@kantin.test',  N'hash_owner2', N'owner'),
        (4,  N'Pak Makmur',   N'makmur@kantin.test',  N'hash_owner3', N'owner'),
        (5,  N'Cak Nur',      N'caknur@kantin.test',  N'hash_owner4', N'owner'),
        (6,  N'Bu Wati',      N'wati@kantin.test',    N'hash_owner5', N'owner'),
        (7,  N'Mas Bayu',     N'bayu@kantin.test',    N'hash_owner6', N'owner'),
        (8,  N'Mas Andre',    N'andre@kantin.test',   N'hash_owner7', N'owner'),
        (9,  N'Bu Inah',      N'inah@kantin.test',    N'hash_owner8', N'owner'),
        (10, N'Bu Sari',      N'sari@kantin.test',    N'hash_owner9', N'owner'),
        (11, N'Pak Hasan',    N'hasan@kantin.test',   N'hash_owner10',N'owner'),
        (12, N'Bagas Pratama',N'bagas@student.test',  N'hash_cust1',  N'customer'),
        (13, N'Sinta Maharani',N'sinta@student.test', N'hash_cust2',  N'customer'),
        (14, N'Yoga Saputra', N'yoga@student.test',   N'hash_cust3',  N'customer'),
        (15, N'Dewi Lestari', N'dewi@student.test',   N'hash_cust4',  N'customer')
) AS v (id, name, email, password_hash, role)
WHERE NOT EXISTS (SELECT 1 FROM dbo.USERS t WHERE t.id = v.id OR t.email = v.email);
PRINT 'USERS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.USERS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_USERS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.USERS);
DBCC CHECKIDENT ('dbo.USERS', RESEED, @max_USERS) WITH NO_INFOMSGS;
GO

-- STALLS
SET IDENTITY_INSERT dbo.STALLS ON;

INSERT INTO dbo.STALLS (id, owner_id, name, category, location, description, avg_rating, review_count)
SELECT v.id, v.owner_id, v.name, v.category, v.location, v.description, v.avg_rating, v.review_count
FROM (VALUES
        (1,  2,  N'Warung Bu Tini',    N'Kwetiau', N'Kantin FKIP',  N'Kedai kwetiau goreng & kuah',          4.50, 2),
        (2,  9,  N'Dapur Bu Inah',     N'Nasi',    N'Kantin FKIP',  N'Nasi goreng dadakan',                  4.00, 1),
        (3,  3,  N'Kedai Pak Slamet',  N'Bakso',   N'Kantin FK',    N'Bakso urat jumbo & beranak',           4.67, 3),
        (4,  5,  N'Kedai Cak Nur',     N'Mie',     N'Kantin FK',    N'Mie ayam original & pangsit',          4.00, 1),
        (5,  4,  N'Warung Makmur',     N'Minuman', N'Kantin FEB',   N'Aneka es teh',                         4.50, 2),
        (6,  10, N'Kedai Segar',       N'Minuman', N'Kantin FEB',   N'Jus buah tanpa gula tambahan',         5.00, 1),
        (7,  7,  N'Dapur Mas Bayu',    N'Western', N'Kantin FEB',   N'Chicken steak & katsu hot plate',      4.50, 2),
        (8,  8,  N'Warung Mas Andre',  N'Sate',    N'Kantin FISIP', N'Sate ayam & kambing bumbu kacang',     4.00, 1),
        (9,  6,  N'Warung Bu Wati',    N'Soto',    N'Kantin FISIP', N'Soto ayam kuah bening',                4.50, 2),
        (10, 11, N'Dapur Pak Hasan',   N'Nasi',    N'Kantin FKIP',  N'Nasi uduk dengan aneka lauk',          4.00, 1)
) AS v (id, owner_id, name, category, location, description, avg_rating, review_count)
WHERE NOT EXISTS (SELECT 1 FROM dbo.STALLS t WHERE t.id = v.id)
      AND EXISTS (SELECT 1 FROM dbo.USERS u WHERE u.id = v.owner_id);
PRINT 'STALLS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.STALLS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_STALLS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.STALLS);
DBCC CHECKIDENT ('dbo.STALLS', RESEED, @max_STALLS) WITH NO_INFOMSGS;
GO

-- MENU_ITEMS
SET IDENTITY_INSERT dbo.MENU_ITEMS ON;

INSERT INTO dbo.MENU_ITEMS (id, stall_id, name, price, is_available)
SELECT v.id, v.stall_id, v.name, v.price, v.is_available
FROM (VALUES
        (1,  1, N'Kwetiau Goreng Spesial', 15000, 1),
        (2,  1, N'Kwetiau Kuah',           13000, 1),
        (3,  2, N'Nasi Goreng Spesial',    14000, 1),
        (4,  2, N'Nasi Goreng Telur',      12000, 1),
        (5,  3, N'Bakso Urat Jumbo',       18000, 1),
        (6,  3, N'Bakso Beranak',          25000, 1),
        (7,  4, N'Mie Ayam Original',      12000, 1),
        (8,  4, N'Mie Ayam Pangsit',       15000, 1),
        (9,  5, N'Es Teh Manis',            4000, 1),
        (10, 5, N'Es Teh Jumbo',            6000, 1),
        (11, 6, N'Jus Alpukat',            12000, 1),
        (12, 6, N'Jus Mangga',             10000, 1),
        (13, 7, N'Chicken Steak Hot Plate',25000, 1),
        (14, 7, N'Chicken Katsu',          22000, 1),
        (15, 8, N'Sate Ayam 10 Tusuk',     20000, 1),
        (16, 8, N'Sate Kambing 10 Tusuk',  30000, 1),
        (17, 9, N'Soto Ayam',              13000, 1),
        (18, 9, N'Soto Ayam + Nasi',       16000, 1),
        (19, 10, N'Nasi Uduk Komplit',     15000, 1),
        (20, 10, N'Nasi Uduk Ayam',        17000, 1)
) AS v (id, stall_id, name, price, is_available)
WHERE NOT EXISTS (SELECT 1 FROM dbo.MENU_ITEMS t WHERE t.id = v.id)
      AND EXISTS (SELECT 1 FROM dbo.STALLS s WHERE s.id = v.stall_id);
PRINT 'MENU_ITEMS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.MENU_ITEMS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_MENU_ITEMS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.MENU_ITEMS);
DBCC CHECKIDENT ('dbo.MENU_ITEMS', RESEED, @max_MENU_ITEMS) WITH NO_INFOMSGS;
GO

-- REVIEWS
SET IDENTITY_INSERT dbo.REVIEWS ON;

INSERT INTO dbo.REVIEWS (id, stall_id, user_id, rating, comment)
SELECT v.id, v.stall_id, v.user_id, v.rating, v.comment
FROM (VALUES
        (1,  1,  12, 5, N'Enak!'),
        (2,  1,  13, 4, N'Oke'),
        (3,  2,  12, 4, N'Lumayan'),
        (4,  3,  12, 5, N'Baksonya mantap'),
        (5,  3,  13, 5, N'Jumbo!'),
        (6,  3,  14, 4, N'Enak'),
        (7,  4,  13, 4, N'Standar'),
        (8,  5,  14, 5, N'Segar'),
        (9,  5,  15, 4, N'Murah'),
        (10, 6,  15, 5, N'Mantap'),
        (11, 7,  12, 5, N'Porsi besar'),
        (12, 7,  14, 4, N'Oke'),
        (13, 8,  13, 4, N'Enak'),
        (14, 9,  12, 5, N'Kuahnya enak'),
        (15, 9,  15, 4, N'Lumayan'),
        (16, 10, 14, 4, N'Oke')
) AS v (id, stall_id, user_id, rating, comment)
WHERE NOT EXISTS (SELECT 1 FROM dbo.REVIEWS t WHERE t.id = v.id OR (t.user_id = v.user_id AND t.stall_id = v.stall_id))
      AND EXISTS (SELECT 1 FROM dbo.STALLS s WHERE s.id = v.stall_id)
      AND EXISTS (SELECT 1 FROM dbo.USERS u WHERE u.id = v.user_id);
PRINT 'REVIEWS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.REVIEWS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_REVIEWS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.REVIEWS);
DBCC CHECKIDENT ('dbo.REVIEWS', RESEED, @max_REVIEWS) WITH NO_INFOMSGS;
GO

-- LIKES
SET IDENTITY_INSERT dbo.LIKES ON;

INSERT INTO dbo.LIKES (id, review_id, user_id)
SELECT v.id, v.review_id, v.user_id
FROM (VALUES
        (1, 1, 14),
        (2, 4, 13),
        (3, 4, 15),
        (4, 8, 12),
        (5, 10, 12),
        (6, 14, 13)
) AS v (id, review_id, user_id)
WHERE NOT EXISTS (SELECT 1 FROM dbo.LIKES t WHERE t.id = v.id OR (t.review_id = v.review_id AND t.user_id = v.user_id))
      AND EXISTS (SELECT 1 FROM dbo.REVIEWS r WHERE r.id = v.review_id)
      AND EXISTS (SELECT 1 FROM dbo.USERS u WHERE u.id = v.user_id);
PRINT 'LIKES ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.LIKES OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_LIKES INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.LIKES);
DBCC CHECKIDENT ('dbo.LIKES', RESEED, @max_LIKES) WITH NO_INFOMSGS;
GO

-- FLAGS
SET IDENTITY_INSERT dbo.FLAGS ON;

INSERT INTO dbo.FLAGS (id, review_id, reported_by, reason, status)
SELECT v.id, v.review_id, v.reported_by, v.reason, v.status
FROM (VALUES
        (1, 2, 12, N'Komentar tidak relevan', N'pending'),
        (2, 7, 14, N'Dicurigai spam', N'pending'),
        (3, 9, 13, N'Bahasa kasar', N'resolved'),
        (4, 13, 15, N'Review duplikat', N'dismissed'),
        (5, 16, 12, N'Rating tidak sesuai komentar', N'pending')
) AS v (id, review_id, reported_by, reason, status)
WHERE NOT EXISTS (SELECT 1 FROM dbo.FLAGS t WHERE t.id = v.id)
      AND EXISTS (SELECT 1 FROM dbo.REVIEWS r WHERE r.id = v.review_id)
      AND EXISTS (SELECT 1 FROM dbo.USERS u WHERE u.id = v.reported_by);
PRINT 'FLAGS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.FLAGS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_FLAGS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.FLAGS);
DBCC CHECKIDENT ('dbo.FLAGS', RESEED, @max_FLAGS) WITH NO_INFOMSGS;
GO

-- AUDIT_LOGS
SET IDENTITY_INSERT dbo.AUDIT_LOGS ON;

INSERT INTO dbo.AUDIT_LOGS (id, user_id, action, target_table, target_id, metadata)
SELECT v.id, v.user_id, v.action, v.target_table, v.target_id, v.metadata
FROM (VALUES
        (1, 1, N'CREATE', N'STALLS', 1, N'{"name":"Warung Bu Tini"}'),
        (2, 1, N'UPDATE', N'STALLS', 3, N'{"field":"avg_rating"}'),
        (3, 2, N'CREATE', N'MENU_ITEMS', 1, N'{"name":"Kwetiau Goreng Spesial"}'),
        (4, 1, N'DELETE', N'REVIEWS', 5, N'{"reason":"flagged"}'),
        (5, 1, N'UPDATE', N'FLAGS', 3, N'{"status":"resolved"}')
) AS v (id, user_id, action, target_table, target_id, metadata)
WHERE NOT EXISTS (SELECT 1 FROM dbo.AUDIT_LOGS t WHERE t.id = v.id)
      AND EXISTS (SELECT 1 FROM dbo.USERS u WHERE u.id = v.user_id);
PRINT 'AUDIT_LOGS ditambahkan: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

SET IDENTITY_INSERT dbo.AUDIT_LOGS OFF;

-- Identity dilanjutkan dari id terbesar yang ada, supaya insert berikutnya tidak bentrok.
DECLARE @max_AUDIT_LOGS INT = (SELECT ISNULL(MAX(id), 0) FROM dbo.AUDIT_LOGS);
DBCC CHECKIDENT ('dbo.AUDIT_LOGS', RESEED, @max_AUDIT_LOGS) WITH NO_INFOMSGS;
GO

-- Samakan avg_rating dan review_count warung dengan data REVIEWS yang sebenarnya.
UPDATE s
SET s.review_count = ISNULL(r.cnt, 0),
    s.avg_rating   = CAST(ISNULL(r.avg_val, 0) AS DECIMAL(3,2))
FROM dbo.STALLS s
LEFT JOIN (
    SELECT stall_id,
           COUNT(*) AS cnt,
           AVG(CAST(rating AS DECIMAL(5,2))) AS avg_val
    FROM dbo.REVIEWS
    GROUP BY stall_id
) r ON r.stall_id = s.id;
GO

PRINT 'Seed selesai.';
GO

SELECT 'USERS' AS tabel, COUNT(*) AS jumlah FROM dbo.USERS
UNION ALL SELECT 'STALLS', COUNT(*) FROM dbo.STALLS
UNION ALL SELECT 'MENU_ITEMS', COUNT(*) FROM dbo.MENU_ITEMS
UNION ALL SELECT 'REVIEWS', COUNT(*) FROM dbo.REVIEWS
UNION ALL SELECT 'LIKES', COUNT(*) FROM dbo.LIKES
UNION ALL SELECT 'FLAGS', COUNT(*) FROM dbo.FLAGS
UNION ALL SELECT 'AUDIT_LOGS', COUNT(*) FROM dbo.AUDIT_LOGS;
GO
