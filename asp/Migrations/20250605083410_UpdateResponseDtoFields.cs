using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace _.Migrations
{
    /// <inheritdoc />
    public partial class UpdateResponseDtoFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Adliyes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Adi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Adres = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    HaritaLinki = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    ResimUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    PersonelSayisi = table.Column<int>(type: "integer", nullable: true),
                    YapimYili = table.Column<int>(type: "integer", nullable: true),
                    LojmanVarMi = table.Column<int>(type: "integer", nullable: true),
                    KresVarMi = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adliyes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Sicil = table.Column<int>(type: "integer", nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Telefon = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    MevcutAdliyeId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Adliyes_MevcutAdliyeId",
                        column: x => x.MevcutAdliyeId,
                        principalTable: "Adliyes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TransferRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    TransferType = table.Column<string>(type: "text", nullable: false),
                    RequestedAdliyeIdsJson = table.Column<string>(type: "jsonb", nullable: false),
                    DocumentsPath = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CurrentAdliyeId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferRequests_Adliyes_CurrentAdliyeId",
                        column: x => x.CurrentAdliyeId,
                        principalTable: "Adliyes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransferRequests_CurrentAdliyeId",
                table: "TransferRequests",
                column: "CurrentAdliyeId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferRequests_UserId",
                table: "TransferRequests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_MevcutAdliyeId",
                table: "Users",
                column: "MevcutAdliyeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Sicil",
                table: "Users",
                column: "Sicil",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransferRequests");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Adliyes");
        }
    }
}
