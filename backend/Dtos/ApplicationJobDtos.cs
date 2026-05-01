using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace aabu_project.Dtos;

public class ApplicationJobCreateDto
{
    public int JobId { get; set; }
    public int UserId { get; set; }
    public string? Note { get; set; }
    public string? Cv { get; set; }
    public IFormFile? CvFile { get; set; }
}

public class ApplicationStatusUpdateDto
{
    public string Status { get; set; } = null!;
}
