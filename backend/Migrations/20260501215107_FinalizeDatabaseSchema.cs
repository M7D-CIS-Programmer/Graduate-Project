using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Experiences: StartDate / EndDate already altered by earlier migration.
            //    AlterColumn is safe to run again (idempotent in SQL Server because it
            //    only changes the column definition when the type actually differs).
            migrationBuilder.AlterColumn<string>(
                name: "StartDate",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "EndDate",
                table: "Experiences",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            // ── Categories.CreatedAt — added by 20260430200000_AddUserOwnershipToCategories.
            //    Guard with IF NOT EXISTS so re-running is safe.
            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'CreatedAt'
                )
                BEGIN
                    ALTER TABLE [Categories] ADD [CreatedAt] datetimeoffset NOT NULL
                        DEFAULT '0001-01-01T00:00:00.0000000+00:00';
                END
                """);

            // ── Categories.UserId — same guard.
            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'UserId'
                )
                BEGIN
                    ALTER TABLE [Categories] ADD [UserId] int NULL;
                END
                """);

            // ── Messages table — created by 20260501120000_AddMessagesTable.
            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name = N'Messages' AND xtype = 'U')
                BEGIN
                    CREATE TABLE [Messages] (
                        [Id]               int              IDENTITY(1,1) NOT NULL,
                        [ApplicationJobId] int              NOT NULL,
                        [SenderId]         int              NOT NULL,
                        [Content]          nvarchar(max)    NOT NULL,
                        [SentAt]           datetimeoffset   NOT NULL,
                        [IsRead]           bit              NOT NULL,
                        CONSTRAINT [PK_Messages] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Messages_ApplicationJobs_ApplicationJobId]
                            FOREIGN KEY ([ApplicationJobId]) REFERENCES [ApplicationJobs]([Id])
                            ON DELETE CASCADE,
                        CONSTRAINT [FK_Messages_Users_SenderId]
                            FOREIGN KEY ([SenderId]) REFERENCES [Users]([Id])
                            ON DELETE NO ACTION
                    );
                END
                """);

            // ── Seed data for Categories (only update rows where CreatedAt is still the default).
            migrationBuilder.Sql("""
                UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000+00:00', [UserId] = NULL
                WHERE [Id] IN (1,2,3,4,5) AND [CreatedAt] = '0001-01-01T00:00:00.0000000+00:00';
                """);

            // ── Indexes — create only if absent.
            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.indexes
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'IX_Categories_UserId')
                BEGIN
                    CREATE INDEX [IX_Categories_UserId] ON [Categories]([UserId]);
                END
                """);

            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.indexes
                    WHERE object_id = OBJECT_ID(N'[Messages]') AND name = N'IX_Messages_ApplicationJobId')
                BEGIN
                    CREATE INDEX [IX_Messages_ApplicationJobId] ON [Messages]([ApplicationJobId]);
                END
                """);

            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.indexes
                    WHERE object_id = OBJECT_ID(N'[Messages]') AND name = N'IX_Messages_SenderId')
                BEGIN
                    CREATE INDEX [IX_Messages_SenderId] ON [Messages]([SenderId]);
                END
                """);

            // ── FK Categories → Users — create only if absent.
            migrationBuilder.Sql("""
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys
                    WHERE name = N'FK_Categories_Users_UserId')
                BEGIN
                    ALTER TABLE [Categories]
                        ADD CONSTRAINT [FK_Categories_Users_UserId]
                        FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
                        ON DELETE SET NULL;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Categories_Users_UserId')
                    ALTER TABLE [Categories] DROP CONSTRAINT [FK_Categories_Users_UserId];
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sysobjects WHERE name = N'Messages' AND xtype = 'U')
                    DROP TABLE [Messages];
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.indexes
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'IX_Categories_UserId')
                    DROP INDEX [IX_Categories_UserId] ON [Categories];
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'CreatedAt')
                    ALTER TABLE [Categories] DROP COLUMN [CreatedAt];
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'[Categories]') AND name = N'UserId')
                    ALTER TABLE [Categories] DROP COLUMN [UserId];
                """);

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Experiences",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "Experiences",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
