-- Login KHUSUS untuk Tugas 2 (beda dari praktikum_user di hands-on),
-- supaya kredensial tugas & praktikum tidak tercampur.
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'verla')
BEGIN
    CREATE LOGIN verla
        WITH PASSWORD = N'Verla_Tugas2026!',
             DEFAULT_DATABASE = review_kantin;
END
GO

USE review_kantin;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'verla')
BEGIN
    CREATE USER verla FOR LOGIN verla;
END
GO

ALTER ROLE db_datareader ADD MEMBER verla;
ALTER ROLE db_datawriter ADD MEMBER verla;
GO

SELECT name, type_desc, authentication_type_desc
FROM sys.database_principals
WHERE name = 'verla';
GO
