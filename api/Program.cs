using Azure.Communication.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy(
        name: "MyCorsOrigins",
        builder => {
            builder.WithOrigins(
                "http://localhost:8080"
            );
        }
    );
});

var client = new CommunicationIdentityClient(builder.Configuration["Acs:ConnectionString"]);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("MyCorsOrigins");

app.MapGet("/users/id", async () => {
    var userResponse = await client.CreateUserAsync();
    return userResponse.Value;
});

app.MapGet("/users/token", async () => {
    var tokenResponse = await client.CreateUserAndTokenAsync(scopes: new[] { CommunicationTokenScope.VoIP });
    return tokenResponse.Value;
});

app.MapGet("/meeting/id", () => {
    return new { id = Guid.NewGuid() };
});

app.Run();