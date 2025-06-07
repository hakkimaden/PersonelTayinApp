// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using TayinAspApi.Models;

namespace TayinAspApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Adliye> Adliyes { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<TransferRequest> TransferRequests { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Adliye tablosu için CreatedAt ve UpdatedAt varsayılan değerleri
            modelBuilder.Entity<Adliye>()
                .Property(a => a.CreatedAt)
                .HasDefaultValueSql("NOW()"); // PostgreSQL'de current timestamp için NOW() kullanın
            modelBuilder.Entity<Adliye>()
                .Property(a => a.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            // User tablosu için CreatedAt ve UpdatedAt varsayılan değerleri
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("NOW()");
            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            // TransferRequest tablosu için CreatedAt ve UpdatedAt varsayılan değerleri
            modelBuilder.Entity<TransferRequest>()
                .Property(tr => tr.CreatedAt)
                .HasDefaultValueSql("NOW()");
            modelBuilder.Entity<TransferRequest>()
                .Property(tr => tr.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            // Laravel'deki 'sicil' alanının unique olması için
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Sicil)
                .IsUnique();

            // TransferRequest'teki JSON alanı için
            modelBuilder.Entity<TransferRequest>()
                .Property(tr => tr.RequestedAdliyeIdsJson)
                .HasColumnType("jsonb"); // PostgreSQL için JSONB tipi

            // Mevcut Adliye ilişkisi
            modelBuilder.Entity<User>()
                .HasOne(u => u.MevcutAdliye)
                .WithMany() // Adliye tarafında bir koleksiyon yoksa WithMany() kullanın
                .HasForeignKey(u => u.MevcutAdliyeId)
                .IsRequired(false) // nullable
                .OnDelete(DeleteBehavior.Restrict); // Laravel'deki gibi kısıtla

            // TransferRequest - User ilişkisi
            modelBuilder.Entity<TransferRequest>()
                .HasOne(tr => tr.User)
                .WithMany() // User tarafında bir koleksiyon yoksa WithMany() kullanın
                .HasForeignKey(tr => tr.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Talep silindiğinde kullanıcı kalır

            // TransferRequest - CurrentAdliye ilişkisi
            modelBuilder.Entity<TransferRequest>()
                .HasOne(tr => tr.CurrentAdliye)
                .WithMany()
                .HasForeignKey(tr => tr.CurrentAdliyeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}