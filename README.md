Ho gaya. Maine repository se src/store/routineStore.ts nikal liya aur tumhara current default routine dekh liya.

Abhi routine ye hai:

## Routine rules (v3)

- **Wake:** 7:00 AM (no jogging / exercise block).
- **Every morning:** Dashboard par puchha jata hai — *Aaj college jaa rahe ho?* Jawab **9:00 AM tak** valid; uske baad prompt home page se hide ho jayega aur unanswered plan automatically ghar wala routine par save ho jayega. Routine page par college prompt nahi dikhega.
- **College day:** 7–9 breakfast / fresh / ghar ke kaam → 9–9:30 college travel → 9:30 AM–9 PM detailed college/study routine → 9–9:30 dinner → 9:30 PM–12:15 AM coding, projects, games → sleep.
- **Ghar day:** 7–9:30 morning prep → padhai ke blocks **25% chhote** + afternoon *rest, games, projects* block → dinner tak routine → 9:30 PM–12:15 AM coding, projects, games → sleep.
- **Dashboard:** college prompt yahin dikhta hai; prompt 9 AM ke baad hide ho jata hai aur unanswered plan automatically ghar wale routine par save hota hai. Baaki dashboard routine normal tarah se dikhta hai.
- **Sat / Sun (ghar):** naye concepts ki jagah **question solving** focus task titles.

### Detailed daily timetable (adapted from previous routine — jogging/exercise removed to match v3 wake)

Time	Task

07:00–07:30	Freshen up
07:30–08:15	Breakfast + chores
08:15–08:50	Revision
08:50–09:00	Get ready
09:00–09:30	Travel to college
09:30–10:00	Organize notes
10:00–12:00	Maths
12:00–12:15	Break
12:15–13:15	Reasoning / Computer
13:15–13:45	Lunch
13:45–15:15	PYQs
15:15–15:30	Break
15:30–16:30	Topic Test
16:30–17:00	Review Wrong Questions
17:00–17:30	Head Home
17:30–19:00	Walk / Relax
19:00–21:00	Deep Study
21:00–21:30	Dinner
21:30–22:30	Development / Projects
22:30–23:00	Daily Revision
23:00–23:30	Games / Entertainment
23:30–07:00	Sleep

Notes:
- The detailed timetable from the incoming branch was preserved but adjusted to start at 07:00 to match the v3 wake time; the 06:00–07:00 wake/jogging block was removed to honor the v3 rule.  
- Dashboard behaviour from v3 retained: college prompt shows only on the home page until 9:00 AM and is hidden on the routine page.

ye meri purani routine hai humne jo 9.30 AM se 12.15 AM tak pura saath mei likh diya hai usko issi ki tarah detailed mei likhna tha toh waisa bnao + mai dekh rha  ki clg prompt jo hai wo routine waale page pe dikh rhi hai naa ki home page pe wo bhi hamesha usse thik kro aur home page pe sirf 9 AM tak dikhao aur routine page se hatao clg naa jaane waale schedule ko bhi thoda detailed baaki chize dhang se implement hui hai ya nhi check krlena. 

Mere wake up ke time ko 7 AM
Jogging & exercise hata do
Ab se daily subah mere se question puchhega website ki mai clg jaa rha ya nhi aaj aisa ye question ki validity 9 AM tak hogi agr tab tak respond nhi kiya toh by default nhi jaa rha wala routine chalega
Ab clg jaa rha wala routine
7 AM - 9AM breakfast, fresh hona, ghar ke kaam niptana
9 se 9.30 clg jaana
Fir dinner tak same
9.30 se 12.15 tak coding development & projects & game khelna etc
12.15 se 7 baje tak sleep

Jab clg naa jaaye tab k liye
7AM - 9.30 AM break, fresh hona, ghar ke kaam niptana
Fir baaki padhai ke saari padhai ke duration ko 25% kam krdo taaki dopahar ko aram kru + game khelu + projects wagera banau
Dinner tak aisa hi rakhna fir baaki chize same rhegi
And saturday & sunday new concepts ke baajaye question solving focused rakhna
ye hai implementation changes ki list. 
issi se check krlena
