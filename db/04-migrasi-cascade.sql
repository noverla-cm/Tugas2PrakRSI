-- Migrasi: memastikan foreign key data turunan memakai ON DELETE CASCADE.
-- Jalankan HANYA bila database dibuat dari skema lama (tabel sudah ada sebelum 02-schema.sql
-- diperbarui). Aman dijalankan berulang: relasi yang sudah cascade dilewati.
--
-- Relasi yang disesuaikan:
--   MENU_ITEMS.stall_id -> STALLS.id
--   REVIEWS.stall_id    -> STALLS.id
--   LIKES.review_id     -> REVIEWS.id
--   FLAGS.review_id     -> REVIEWS.id
USE review_kantin;
GO

DECLARE @pairs TABLE (child SYSNAME, child_col SYSNAME, parent SYSNAME, fk_name SYSNAME);
INSERT INTO @pairs (child, child_col, parent, fk_name) VALUES
    ('MENU_ITEMS', 'stall_id',  'STALLS',  'FK_MENU_ITEMS_STALLS'),
    ('REVIEWS',    'stall_id',  'STALLS',  'FK_REVIEWS_STALLS'),
    ('LIKES',      'review_id', 'REVIEWS', 'FK_LIKES_REVIEWS'),
    ('FLAGS',      'review_id', 'REVIEWS', 'FK_FLAGS_REVIEWS');

DECLARE @child SYSNAME, @child_col SYSNAME, @parent SYSNAME, @fk_name SYSNAME;
DECLARE @child_id INT, @parent_id INT;
DECLARE @drop NVARCHAR(MAX), @add NVARCHAR(MAX);

DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT child, child_col, parent, fk_name FROM @pairs;

OPEN fk_cursor;
FETCH NEXT FROM fk_cursor INTO @child, @child_col, @parent, @fk_name;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @child_id  = OBJECT_ID('dbo.' + @child);
    SET @parent_id = OBJECT_ID('dbo.' + @parent);

    -- Lewati bila relasi ini sudah memakai cascade (delete_referential_action = 1).
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE parent_object_id = @child_id
          AND referenced_object_id = @parent_id
          AND delete_referential_action = 1
    )
    BEGIN
        -- Hapus foreign key lama (apa pun namanya) antara tabel anak dan induk.
        SET @drop = N'';
        SELECT @drop = @drop
            + N'ALTER TABLE dbo.' + QUOTENAME(@child)
            + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';'
        FROM sys.foreign_keys
        WHERE parent_object_id = @child_id
          AND referenced_object_id = @parent_id;

        IF LEN(@drop) > 0 EXEC sp_executesql @drop;

        -- Buat ulang dengan ON DELETE CASCADE.
        SET @add = N'ALTER TABLE dbo.' + QUOTENAME(@child)
            + N' ADD CONSTRAINT ' + QUOTENAME(@fk_name)
            + N' FOREIGN KEY (' + QUOTENAME(@child_col) + N')'
            + N' REFERENCES dbo.' + QUOTENAME(@parent) + N' (id) ON DELETE CASCADE;';
        EXEC sp_executesql @add;

        PRINT 'Diubah menjadi CASCADE: ' + @fk_name;
    END
    ELSE
        PRINT 'Sudah CASCADE, dilewati: ' + @fk_name;

    FETCH NEXT FROM fk_cursor INTO @child, @child_col, @parent, @fk_name;
END

CLOSE fk_cursor;
DEALLOCATE fk_cursor;
GO

-- Verifikasi: kolom delete_action harus CASCADE untuk empat relasi di atas.
SELECT OBJECT_NAME(parent_object_id)     AS tabel_anak,
       OBJECT_NAME(referenced_object_id) AS tabel_induk,
       name                              AS nama_fk,
       delete_referential_action_desc    AS delete_action
FROM sys.foreign_keys
WHERE OBJECT_NAME(parent_object_id) IN ('MENU_ITEMS', 'REVIEWS', 'LIKES', 'FLAGS')
ORDER BY tabel_anak, tabel_induk;
GO
