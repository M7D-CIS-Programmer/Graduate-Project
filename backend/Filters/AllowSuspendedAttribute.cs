using Microsoft.AspNetCore.Mvc.Filters;

namespace aabu_project.Filters
{
    /// <summary>
    /// Mark an action with this attribute to allow suspended users to reach it.
    /// The <see cref="CheckSuspendedFilter"/> skips its check when this marker
    /// is present — used for the public Contact Us endpoint so suspended users
    /// can still submit a support request.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public sealed class AllowSuspendedAttribute : Attribute, IFilterMetadata { }
}
