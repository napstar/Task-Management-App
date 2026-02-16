using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace SwmcolTaskTracker.API.Auth
{
    public class DevBypassAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public DevBypassAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Create a fake authenticated user for local development
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, "dev-user-id"),
            new Claim(ClaimTypes.Name, "Dev User"),
            new Claim(ClaimTypes.Email, "dev@swmcol.co.tt"),
            new Claim("scp", "access_as_user")
        };

            var identity = new ClaimsIdentity(claims, "DevBypass");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "DevBypass");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
