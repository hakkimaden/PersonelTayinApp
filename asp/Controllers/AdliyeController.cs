using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinAspApi.Data;
using TayinAspApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations; 

namespace TayinAspApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdliyelerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdliyelerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/adliyeler
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Adliye>>> GetAdliyes()
        {
            var adliyeler = await _context.Adliyes.OrderBy(a => a.Adi).ToListAsync();
            return Ok(adliyeler);
        }

        // GET: api/adliyeler/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Adliye>> GetAdliye(int id)
        {
            var adliye = await _context.Adliyes.FindAsync(id);

            if (adliye == null)
            {
                return NotFound();
            }

            return Ok(adliye);
        }
    }
}