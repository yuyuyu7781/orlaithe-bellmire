# Bellmire walking access (v13.6)

The bakery was reachable via the old inland/western detour; direct route-search
limits did not prove that it was impossible to reach. The missing connection was
a readable short climb from the west quay (1.38) to its forecourt (3.5).

- A 1.3-wide, ten-tread stone stair at x=-24 joins z=31.6 to z=28.
  Each rise is about .212. The existing geometry is also the collision floor.
- The noticeboard and its paper move together .5 to the east so its edge no
  longer catches shoulders at the upper stair. Buildings are unchanged.
- Existing contact placement reserves the quay connection and clears cargo
  beside it, rather than removing items or allowing walking through them.
- The old western stair is widened from .9 to 1.2; the mill approach step from
  .7 to 1.2; cable-car side steps from 1/1.1 to 1.2.
- Existing major street reservations grow from .6 to 1.2 total width so newly
  placed goods cannot occupy the shoulder clearance around those routes.

`humanRouteStandard` in walking.js defines the preferred visible lane width
(1.2), landing depth (1.2), and riser limit (.25). Human body radius stays .24,
stepUp .38 and stepDown .42. Water/cliff checks are unchanged. This is a design
standard, not permission to pass through walls. Three low cat passages retain
separate .13 body radius and .52 height; they are deliberately not widened.

Walking checks use keyboard input and the real movement/collision update; camera
teleportation is not used to establish reachability. The plaza, harbor and market
are connected by real streets, and some routes share these street junctions.
The old cached route toward the market met a visible worktable at its corner;
the verified market route passes around it rather than through its geometry.
