﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TayinAspApi.Data;

#nullable disable

namespace _.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20250608113550_FirstMigration")]
    partial class FirstMigration
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("TayinAspApi.Models.Adliye", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Adi")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<string>("Adres")
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<string>("HaritaLinki")
                        .HasMaxLength(2048)
                        .HasColumnType("character varying(2048)");

                    b.Property<int?>("KresVarMi")
                        .HasColumnType("integer")
                        .HasAnnotation("Relational:JsonPropertyName", "cocuk_kresi_var_mi");

                    b.Property<int?>("LojmanVarMi")
                        .HasColumnType("integer")
                        .HasAnnotation("Relational:JsonPropertyName", "lojman_var_mi");

                    b.Property<int?>("PersonelSayisi")
                        .HasColumnType("integer")
                        .HasAnnotation("Relational:JsonPropertyName", "personel_sayisi");

                    b.Property<string>("ResimUrl")
                        .HasMaxLength(2048)
                        .HasColumnType("character varying(2048)")
                        .HasAnnotation("Relational:JsonPropertyName", "resim_url");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<int?>("YapimYili")
                        .HasColumnType("integer")
                        .HasAnnotation("Relational:JsonPropertyName", "yapim_yili");

                    b.HasKey("Id");

                    b.ToTable("Adliyes");
                });

            modelBuilder.Entity("TayinAspApi.Models.AppLog", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Action")
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<string>("Details")
                        .HasColumnType("text");

                    b.Property<string>("LogLevel")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Username")
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.HasKey("Id");

                    b.ToTable("AppLogs");
                });

            modelBuilder.Entity("TayinAspApi.Models.TransferRequest", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<int?>("CurrentAdliyeId")
                        .HasColumnType("integer");

                    b.Property<string>("DocumentsPath")
                        .HasColumnType("text");

                    b.Property<string>("Reason")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)");

                    b.Property<string>("RequestedAdliyeIdsJson")
                        .IsRequired()
                        .HasColumnType("jsonb");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("TransferType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("CurrentAdliyeId");

                    b.HasIndex("UserId");

                    b.ToTable("TransferRequests");
                });

            modelBuilder.Entity("TayinAspApi.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<bool>("IsAdmin")
                        .HasColumnType("boolean");

                    b.Property<int?>("MevcutAdliyeId")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<int>("Sicil")
                        .HasColumnType("integer");

                    b.Property<string>("Telefon")
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp with time zone")
                        .HasDefaultValueSql("NOW()");

                    b.HasKey("Id");

                    b.HasIndex("MevcutAdliyeId");

                    b.HasIndex("Sicil")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("TayinAspApi.Models.TransferRequest", b =>
                {
                    b.HasOne("TayinAspApi.Models.Adliye", "CurrentAdliye")
                        .WithMany()
                        .HasForeignKey("CurrentAdliyeId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("TayinAspApi.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("CurrentAdliye");

                    b.Navigation("User");
                });

            modelBuilder.Entity("TayinAspApi.Models.User", b =>
                {
                    b.HasOne("TayinAspApi.Models.Adliye", "MevcutAdliye")
                        .WithMany()
                        .HasForeignKey("MevcutAdliyeId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("MevcutAdliye");
                });
#pragma warning restore 612, 618
        }
    }
}
