using System;
using System.Collections.Generic;
namespace aabu_project.Models;

public class Job
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string WorkMode { get; set; } = null!;
    public string Responsibilities { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public int CategoryId { get; set; }
    public bool IsSalaryNegotiable { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Features { get; set; }
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? Company { get; set; }
    public DateTimeOffset PostedDate { get; set; } = DateTimeOffset.Now;
    public int ViewsCount { get; set; }
    public string? SearchKey { get; set; }


    // Navigation
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<ApplicationJob> Applications { get; set; } = new List<ApplicationJob>();
}