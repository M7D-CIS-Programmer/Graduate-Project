using System;
using System.Collections.Generic;
namespace aabu_project.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    /// <summary>null = global/seeded category; non-null = owned by a specific company.</summary>
    public int? UserId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User? User { get; set; }
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
