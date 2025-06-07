using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TayinAspApi.Data;
using TayinAspApi.Models;
using System.Linq;
using System;
using Microsoft.AspNetCore.Identity; // IPasswordHasher için
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TayinAspApi.Services; // AdminCheckService için
using Microsoft.OpenApi.Models; // Swagger için
using Microsoft.EntityFrameworkCore; // Bu zaten olmalıydı
using Npgsql.EntityFrameworkCore.PostgreSQL; // BU YENİ EKLENECEK SATIR
using System.Text.Json;
using Microsoft.Extensions.FileProviders; // Bu using'i ekleyin


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder.Services.AddControllers();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Bu ayar, PascalCase olan C# özellik isimlerinin JSON'da camelCase olarak görünmesini sağlar.
        // Eğer frontend'de 'current_adliye' gibi snake_case isimler bekliyorsanız,
        // JSON serileştirme davranışını değiştirmelisiniz.
        // Örneğin:
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // Varsayılan olarak genellikle bu zaten ayarlanmıştır.

        // Eğer tam olarak snake_case istiyorsanız, özel bir çözüm gerekebilir
        // veya Newtonsoft.Json kullanarak ayarları değiştirebilirsiniz:
        // .AddNewtonsoftJson(options =>
        // {
        //     options.SerializerSettings.ContractResolver = new SnakeCasePropertyNamesContractResolver();
        // });
        // Bu son durum için, Newtonsoft.Json paketini kurmanız ve SnakeCasePropertyNamesContractResolver gibi bir ContractResolver oluşturmanız gerekir.
    });


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TayinAspApi", Version = "v1" });

    // JWT Bearer yetkilendirmesini Swagger UI'a ekleme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Yetkilendirme Başlığı: Örn: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS Politikasını Tanımlama
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000") // React uygulama URL'si
                   .AllowAnyHeader()
                   .AllowCredentials()
                   .AllowAnyMethod();
        });
});


// DbContext yapılandırması
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// AdminCheckService'i ekle
builder.Services.AddScoped<AdminCheckService>();

// IHttpContextAccessor servisini ekle (BU YENİ EKLENECEK SATIR)
builder.Services.AddHttpContextAccessor(); // <-- Bu satırı ekleyin

// PasswordHasher'ı ekle
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();


// JWT Kimlik Doğrulama
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // Buradaki değerleri JwtSettings bölümünden oku
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured."),
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured."),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret Key not configured.") // "Jwt:Key" yerine "JwtSettings:Secret"
            ))
        };
    });


builder.Services.AddAuthorization();


var app = builder.Build();

// --- VERİ TOHUMLAMA (SEEDING) KISMI BAŞLANGICI ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher<User>>();

        // Veritabanının oluştuğundan ve geçişlerin uygulandığından emin olun.
        context.Database.Migrate();

        Random random = new Random();

        var adliyeler = new List<Adliye>
        {
            new Adliye { Adi = "Adana Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/42/225-08-202211-12-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Adıyaman Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/519/dsc00018-2-17-07-202010-44-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Afyonkarahisar Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/48/dsc-2984jpg20-02-202512-17-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Ağrı Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/24/305-01-20223-06-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Amasya Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/53/p-000315-06-202014-25.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Ankara Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/44/c0204f58-3d4e-4207-8825-74090c4c890fWhatsApp%20Image%202019-10-30%20at%2012.34.21.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Antalya Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/14/dsc-0105-copy-jpg13-03-202014-50.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Artvin Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/56/vatandas-giris-kapijpeg15-01-20253-32-pm.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Aydın Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/57/1jpg24-06-202013-54.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Balıkesir Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/62/a921-07-202014-36.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bilecik Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/59/img-4068jpg07-07-202109-23.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bingöl Adliyesi", Adres = "", ResimUrl = "https://iidb.adalet.gov.tr/Resimler/Galeri/9120200941297.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bitlis Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/83/img-0191jpg12-06-20203-14-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bolu Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/128/bolu-adliyesi12-09-20243-40-pm.png", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Burdur Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/634/whatsapp-image-2024-06-28-at-125729-1-28-06-20241-06-pm.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bursa Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/578/whatsapp-image-2021-09-28-at-105354-2-29-09-202110-51.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Çanakkale Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/9/ysklogo09-06-202016-24.png", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Çankırı Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/543/img-8894jpg06-11-20234-46-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Çorum Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/108/manset28-01-202511-00-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Denizli Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/515/ysk-logo18-10-202106-25.png", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Diyarbakır Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/114/117-06-20202-46-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Edirne Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/117/whatsapp-image-2022-06-03-at-17261603-06-20225-35-pm.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Elazığ Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/118/p-000507-07-202016-22.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Erzincan Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/24/305-01-20223-06-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Erzurum Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/24/305-01-20223-06-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Eskişehir Adliyesi", Adres = "", ResimUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT19frHfeZXEFBSn8WSpmyf1AM6rkDKHedvYA&s", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Gaziantep Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/36/2jpg20-07-20201-21-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Giresun Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/137/adliye-1jpg12-07-202113-40.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Gümüşhane Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/138/123-10-202411-40-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Hakkari Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/520/banner230-08-20242-37-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Hatay Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/504/hatay-adliyesi-vatandas-tar26-06-20204-03-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Isparta Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/215/tttt26-03-202114-34.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Mersin Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/205/129-06-202010-24.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "İstanbul Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/17/dji-018301-07-202017-01.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "İzmir Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/161/izmiradliyesi511-06-202011-36.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kars Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/24/305-01-20223-06-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kastamonu Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/187/adliyeon121-08-20203-05-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kayseri Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/437/img-9961jpg17-06-202014-24.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kırklareli Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/524/adliye108-02-202110-54.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kırşehir Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/189/defaultadliyeslayt0703-07-202008-37.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kocaeli Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/12/3jpg11-03-202015-24.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Konya Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/191/110-10-20245-08-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kütahya Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/193/baskan20-07-202012-13-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Malatya Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/25/112-08-202013-59.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Manisa Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/505/10jpg26-06-202009-15.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kahramanmaraş Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/183/adalet-onden04-08-202011-28.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Mardin Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/204/110-07-202013-37.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Muğla Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/208/164328204846427-01-20222-16-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Muş Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/209/2324-07-202011-30.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Nevşehir Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/221/adliye24jpg08-11-202110-30.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Niğde Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/222/dji-0327jpg29-07-20224-12-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Ordu Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/243/210-07-202012-46-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Rize Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/247/kalkanderemulhakat28-07-202011-01.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Sakarya Adliyesi", Adres = "", ResimUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyrqgjivU5yyHmcGt7K6miTPA-qZcWvsljsQ&s", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Samsun Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/275/1jpg13-07-202016-44.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Siirt Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/277/dsc-0026jpg08-07-202016-10.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Sinop Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/280/dsc-032316-07-20203-33-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Sivas Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/281/adliye226-06-202009-59.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Tekirdağ Adliyesi", Adres = "", ResimUrl = "https://dhdb.adalet.gov.tr/Resimler/Galeri/6112019135853a%C3%A7%C4%B1l%C4%B1%C5%9F-4.png", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Tokat Adliyesi", Adres = "", ResimUrl = "https://setaluminyum.com.tr/content/upload/Tamamlanmis-Projeler/Tokat-adalet/100_0845.JPG", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Trabzon Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/6/adliye230-06-20202-51-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Tunceli Adliyesi", Adres = "", ResimUrl = "https://www.turkiyehukuk.org/wp-content/uploads/2015/11/Tunceli-Adliyesi.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Şanlıurfa Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/284/1-1025-06-202008-29.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Uşak Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/533/img-0606jpg14-09-20232-24-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Van Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/348/c5jpg29-06-202010-34-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Yozgat Adliyesi", Adres = "", ResimUrl = "https://edb.adalet.gov.tr/Resimler/Galeri/270920231154494.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Zonguldak Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/525/1nbjpg22-07-20204-26-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Aksaray Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/11/1jpg12-07-202015-19.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bayburt Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/80/ejpg25-06-202011-05.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Karaman Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/522/105207-01-20224-48-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kırıkkale Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/188/avukat-portal17-06-20201-36-pm06-07-202211-34-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Batman Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/79/322-07-202014-28.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Şırnak Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/320/img-20240306-wa000706-03-20243-35-pm.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Bartın Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/69/img-1126jpg12-11-202111-29.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Ardahan Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/18/119-06-202011-46-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Iğdır Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/155/ana2jpg25-06-202013-28.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Yalova Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/351/adliye425-06-202011-31.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Karabük Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/521/120-07-202016-48.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Kilis Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/190/dsc-006425-06-202015-59.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Osmaniye Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/244/502-07-20209-05-am.jpg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Adliye { Adi = "Düzce Adliyesi", Adres = "", ResimUrl = "https://rayp.adalet.gov.tr/Resimler/116/0119-07-202310-36-am.jpeg", YapimYili = random.Next(1985, 2024), PersonelSayisi = random.Next(500, 7501), LojmanVarMi = (int)Math.Round(random.NextDouble()), KresVarMi = (int)Math.Round(random.NextDouble()), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        // Adliye verilerini ekle
        if (!context.Adliyes.Any())
        {
            context.Adliyes.AddRange(adliyeler);
            context.SaveChanges();
            Console.WriteLine("Tüm adliyeler veritabanına eklendi.");
        }

        // Kullanıcı verisini ekle
        if (!context.Users.Any())
        {
            var konyaAdliyesi = context.Adliyes.FirstOrDefault(a => a.Adi == "Konya Adliyesi");
            if (konyaAdliyesi == null)
            {
                Console.WriteLine("Ankara Adliyesi bulunamadı, kullanıcı eklenemedi.");
            }
            else
            {
                var user = new User
                {
                    Name = "Hakkı Maden",
                    Sicil = 221694,
                    Telefon = "5456297673",
                    MevcutAdliyeId = konyaAdliyesi.Id, // İlişkili adliye
                    IsAdmin = true, // Admin kullanıcı yapalım
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                user.Password = passwordHasher.HashPassword(user, "221694"); // Güvenli şifre hashleme

                context.Users.Add(user);
                context.SaveChanges();
                Console.WriteLine("Örnek kullanıcı eklendi.\n Örnek kullanıcı bilgileri:\n" +
                                  $"Sicil: {user.Sicil}\nŞifre: 221694");
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veri tohumlama sırasında bir hata oluştu.");
    }
}
// --- VERİ TOHUMLAMA (SEEDING) KISMI SONU ---


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting(); // Bu satırı ekleyin

app.UseStaticFiles();

// Özel bir RequestPath ile statik dosyaları sunmak için
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")), // wwwroot/uploads klasörünüzü işaret eder
    RequestPath = "/uploads" // Bu prefix ile erişilebilir olmasını sağlar
});

app.UseCors("AllowSpecificOrigin"); // Tanımladığımız politikayı burada kullanıyoruz

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();