import { GullySidebar } from '../../gully/GullySidebar'

// Gully: the upstream cobalt <Sidebar /> hardcodes Arbitrum's logo, links and footer; see gully/GullySidebar.tsx
export const AppSidebar = () => {
  return (
    <div className="sticky left-0 top-0 z-20 hidden h-full font-normal sm:flex">
      <GullySidebar />
    </div>
  )
}
