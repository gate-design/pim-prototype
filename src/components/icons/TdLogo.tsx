/**
 * TD logo — used in SideNav for Tenant and Lender selectors.
 */

export function TdLogo({ size = 24, ...props }: { size?: number } & React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M4 26.8452H28V5.38151H4V26.8452Z" fill="#54B948" />
      <path
        d="M19.7565 22.2021H14.1664V12.1317H16.9741V20.4183H19.6746C21.5387 20.4183 22.3218 19.1269 22.3218 15.8012C22.3218 12.4556 21.4322 11.4834 19.5398 11.4834H13.3809V22.2021H10.6006V11.4834H6.52051V9.69557H20.4059C23.7551 9.69557 25.3462 11.4286 25.3462 15.7746C25.3462 21.5002 22.9705 22.2021 19.7565 22.2021Z"
        fill="white"
      />
    </svg>
  );
}
