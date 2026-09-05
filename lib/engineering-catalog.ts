export type CatalogModule = { id: string; title: string; lesson: string; practical: string };
export type LearningTrack = { id: string; title: string; description: string; modules: CatalogModule[] };
export type EngineeringProgram = { code: string; title: string; family: string; tracks: LearningTrack[] };

const moduleSet = (track: string, topics: string[]): CatalogModule[] => topics.map((title, i) => ({
  id: `${track.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
  title,
  lesson: `Learn ${title} through concepts, examples, visual explanations, interview notes and practical use cases in ${track}.`,
  practical: `Solve a practical ${track} problem using ${title}. Write the solution, test edge cases and explain your approach.`,
}));

const track = (id: string, title: string, topics: string[]): LearningTrack => ({
  id, title, description: `${title} learning path with lessons, quizzes, coding practice, projects and AI assistance.`, modules: moduleSet(title, topics)
});

const tracks = {
  programming: track('programming', 'Programming Fundamentals', ['Variables & Data Types','Operators','Conditions','Loops','Functions','Arrays & Strings','Collections','OOP','Recursion','File Handling','Exceptions','Problem Solving']),
  dsa: track('dsa', 'Data Structures & Algorithms', ['Complexity Analysis','Arrays','Strings','Linked Lists','Stacks','Queues','Hashing','Trees','Binary Search Trees','Heaps','Graphs','Sorting','Searching','Greedy Algorithms','Dynamic Programming']),
  aiml: track('aiml', 'Artificial Intelligence & Machine Learning', ['Python for AI','NumPy','Pandas','Statistics','Data Cleaning','Feature Engineering','Linear Regression','Classification','Decision Trees','Random Forest','Clustering','Model Evaluation','Deep Learning','NLP','Computer Vision','Generative AI','AI Deployment']),
  data: track('data', 'Data Science & Analytics', ['Python for Data Science','Statistics','SQL','Data Cleaning','Exploratory Data Analysis','Pandas','Visualization','Probability','Hypothesis Testing','Regression','Machine Learning','Dashboards','Data Storytelling','Data Science Project']),
  web: track('web', 'Web Development', ['HTML','CSS','JavaScript','TypeScript','React','Next.js','REST APIs','Authentication','Databases','Testing','Performance','Deployment','Full Stack Project']),
  cyber: track('cyber', 'Cyber Security', ['Security Fundamentals','Networking','Linux Security','Cryptography','Web Security','Secure Coding','Ethical Security','Digital Forensics','Malware Basics','Incident Response','Security Operations','Cyber Security Project']),
  cloud: track('cloud', 'Cloud & DevOps', ['Linux','Git & GitHub','Networking','Docker','CI/CD','Cloud Fundamentals','AWS/Azure Concepts','Containers','Kubernetes','Infrastructure as Code','Monitoring','Cloud Security','DevOps Project']),
  embedded: track('embedded', 'Embedded Systems & IoT', ['C Programming','Microcontrollers','Digital I/O','Timers & Interrupts','UART/SPI/I2C','Sensors','Embedded C','RTOS','IoT Protocols','MQTT','Edge Computing','IoT Cloud','Embedded Project']),
  electronics: track('electronics', 'Electronics & Communication', ['Circuit Analysis','Analog Electronics','Digital Electronics','Signals & Systems','Microprocessors','Microcontrollers','Communication Systems','Digital Communication','RF Basics','Antennas','VLSI Fundamentals','Embedded Applications']),
  electrical: track('electrical', 'Electrical & Power Systems', ['Electrical Circuits','Electrical Machines','Transformers','Power Systems','Generation','Transmission','Distribution','Protection','Power Electronics','Control Systems','Renewable Energy','Smart Grid','Electrical Project']),
  control: track('control', 'Control & Automation', ['Control Fundamentals','Transfer Functions','Block Diagrams','Feedback Systems','PID Control','Sensors','Actuators','PLC','SCADA','Industrial Automation','Robotics Basics','Automation Project']),
  mechanical: track('mechanical', 'Mechanical Engineering Core', ['Engineering Mechanics','Thermodynamics','Fluid Mechanics','Heat Transfer','Machine Design','Materials','Manufacturing','CNC','CAD','CAM','Maintenance','Mechanical Project']),
  manufacturing: track('manufacturing', 'Manufacturing & Production', ['Manufacturing Processes','Casting','Welding','Machining','CNC','CAD/CAM','Additive Manufacturing','Production Planning','Quality Control','Lean Manufacturing','Operations Research','Industrial Automation','Manufacturing Project']),
  civil: track('civil', 'Civil Engineering Core', ['Engineering Materials','Surveying','Strength of Materials','Structural Analysis','Concrete Technology','Steel Structures','Geotechnical Engineering','Transportation','Environmental Engineering','Water Resources','Construction Management','Estimation','Civil Project']),
  materials: track('materials', 'Materials & Metallurgical Engineering', ['Materials Science','Physical Metallurgy','Extractive Metallurgy','Phase Diagrams','Heat Treatment','Mechanical Testing','Corrosion','Ceramics','Polymers','Composites','Nanomaterials','Materials Characterization','Materials Project']),
  chemical: track('chemical', 'Chemical & Process Engineering', ['Material Balances','Energy Balances','Fluid Mechanics','Heat Transfer','Mass Transfer','Thermodynamics','Reaction Engineering','Process Control','Process Design','Chemical Safety','Process Simulation','Chemical Engineering Project']),
  bio: track('bio', 'Biotechnology & Bioengineering', ['Cell Biology','Molecular Biology','Genetics','Microbiology','Biochemistry','Genetic Engineering','Bioinformatics','Bioprocessing','Fermentation','Bioreactors','Biomedical Applications','Biotechnology Project']),
  food: track('food', 'Food Engineering & Technology', ['Food Chemistry','Food Microbiology','Food Processing','Thermal Processing','Food Preservation','Food Packaging','Food Safety','Quality Control','Dairy Processing','Food Biotechnology','Food Plant Design','Food Technology Project']),
  textile: track('textile', 'Textile Engineering & Technology', ['Textile Fibres','Spinning','Yarn Manufacturing','Weaving','Knitting','Dyeing','Printing','Textile Testing','Garment Technology','Technical Textiles','Textile CAD','Textile Production Project']),
  agriculture: track('agriculture', 'Agricultural Engineering', ['Farm Machinery','Agricultural Power','Soil & Water Engineering','Irrigation','Drainage','Farm Structures','Food Processing','Precision Agriculture','Sensors & IoT','Renewable Energy','Agricultural Automation','Agricultural Project']),
  mining: track('mining', 'Mining Engineering', ['Mining Geology','Mine Planning','Surface Mining','Underground Mining','Rock Mechanics','Mine Ventilation','Mineral Processing','Blasting','Mine Safety','Mine Economics','Mining Automation','Mining Project']),
  design: track('design', 'Industrial & Product Design', ['Design Thinking','Engineering Drawing','CAD','3D Modelling','Materials & Manufacturing','Ergonomics','Product Development','Prototyping','UX Fundamentals','Design for Manufacturing','Sustainable Design','Product Design Project']),
  physics: track('physics', 'Engineering Physics', ['Classical Mechanics','Electromagnetism','Quantum Physics','Thermodynamics','Optics','Solid State Physics','Semiconductor Physics','Photonics','Nuclear Physics','Materials Science','Computational Physics','Physics Project']),
};

const p = (code: string, title: string, family: string, chosen: LearningTrack[]): EngineeringProgram => ({ code, title, family, tracks: chosen });

export const ENGINEERING_PROGRAMS: EngineeringProgram[] = [
 p('CHY','5 year Integrated M.Sc. In Chemistry','Science',[tracks.chemical]),
 p('MAT','5 year Integrated M.Sc. In Mathematics','Science',[tracks.dsa,tracks.physics]),
 p('PHY','5 year Integrated M.Sc. In Physics','Science',[tracks.physics]),
 p('AGR','Agricultural Engineering','Agriculture',[tracks.agriculture]),
 p('CHD','B.Tech Chemical Engineering & M.Tech. Chemical Engineering 5-year Dual Degree','Chemical',[tracks.chemical]),
 p('CIT','B.Tech Civil Engineering & M. Tech. Transportation Engineering 5-year Dual Degree','Civil',[tracks.civil]),
 p('CIR','B.Tech Civil Engineering & M. Tech. Water Resources Engineering 5-year Dual Degree','Civil',[tracks.civil]),
 p('CEC','B.Tech Computer Science & Engg. and M.Tech. Computer Science 5-year Dual Degree','Computing',[tracks.programming,tracks.dsa,tracks.web]),
 p('EES','B.Tech Electrical Engineering & M.Tech. Electronic Systems & Communications 5-year Dual Degree','Electrical',[tracks.electrical,tracks.electronics]),
 p('CIC','B.Tech. Ceramic Engineering & M.Tech. in Industrial Ceramics 5-year Dual Degree','Materials',[tracks.materials]),
 p('EEA','B.Tech. Electrical Engineering & M.Tech. Control & Automation 5-year Dual Degree','Electrical',[tracks.electrical,tracks.control]),
 p('EPE','B.Tech. Electrical Engineering & M.Tech. Power Electronics & Drives 5-year Dual Degree','Electrical',[tracks.electrical,tracks.control]),
 p('ECN','B.Tech. Electronics & Communication Engineering & M.Tech. Communication & Network 5-year Dual Degree','Electronics',[tracks.electronics,tracks.embedded]),
 p('ECV','B.Tech. Electronics & Instrumentation Engineering & M.Tech. VLSI Design & Embedded Systems 5-year Dual Degree','Electronics',[tracks.electronics,tracks.embedded]),
 p('IDE','B.Tech. Industrial Design','Design',[tracks.design]),
 p('MEA','B.Tech. Mechanical Engineering & M.Tech. Mechatronics & Automation 5-year Dual Degree','Mechanical',[tracks.mechanical,tracks.control]),
 p('MMD','B.Tech. Metallurgical & Materials Engineering & M.Tech. Metallurgical & Materials Engineering 5-year Dual Degree','Materials',[tracks.materials]),
 p('MND','B.Tech. Mining Engineering & M.Tech. Mining Engineering 5-year Dual Degree','Mining',[tracks.mining]),
 p('BIO','Bio Engineering','Bio',[tracks.bio]),
 p('BMD','Bio Medical Engineering','Bio',[tracks.bio,tracks.electronics]),
 p('BOT','Bio Technology','Bio',[tracks.bio]),
 p('BTE','Bio Technology Engineering','Bio',[tracks.bio]),
 p('CTT','Carpet & Textile Technology','Textile',[tracks.textile]),
 p('CER','Ceramic Engineering','Materials',[tracks.materials]),
 p('CHP','Chemical & Polymer Engineering','Chemical',[tracks.chemical,tracks.materials]),
 p('CHE','Chemical Engineering / Technology','Chemical',[tracks.chemical]),
 p('CIV','Civil Engineering','Civil',[tracks.civil]),
 p('COE','Computer Engineering','Computing',[tracks.programming,tracks.dsa,tracks.web,tracks.embedded]),
 p('CSS','Computer Science & Engg. and M.Tech. Information Security 5-year Dual Degree','Computing',[tracks.programming,tracks.dsa,tracks.cyber]),
 p('CSE','Computer Science & Engineering','Computing',[tracks.programming,tracks.dsa,tracks.web,tracks.aiml,tracks.cyber,tracks.cloud]),
 p('EEE','Electrical & Electronics Engineering','Electrical',[tracks.electrical,tracks.electronics,tracks.control]),
 p('ELE','Electrical Engineering','Electrical',[tracks.electrical]),
 p('ECO','Electronics & Communication','Electronics',[tracks.electronics]),
 p('ECE','Electronics & Communication Engineering','Electronics',[tracks.electronics,tracks.embedded]),
 p('EIE','Electronics & Instrumentation','Electronics',[tracks.electronics,tracks.control]),
 p('EIN','Electronics & Instrumentation Engg','Electronics',[tracks.electronics,tracks.control]),
 p('ETE','Electronics & Tele Communication Engineering','Electronics',[tracks.electronics]),
 p('EDM','Electronics Engineering - Design & Manufacturing','Electronics',[tracks.electronics,tracks.manufacturing]),
 p('EPH','Engineering Physics','Science',[tracks.physics]),
 p('FET','Food Engineering and Technology','Food',[tracks.food]),
 p('IPE','Industrial and Production Engineering','Manufacturing',[tracks.manufacturing]),
 p('IBT','Industrial Bio-Technology','Bio',[tracks.bio]),
 p('IEM','Industrial Engineering and Management','Industrial',[tracks.manufacturing,tracks.control]),
 p('ITY','Information Technology','Computing',[tracks.programming,tracks.web,tracks.cloud,tracks.data]),
 p('ITE','Information Technology Engineering','Computing',[tracks.programming,tracks.web,tracks.cloud]),
 p('ICE','Instrumentation & Control Engineering','Instrumentation',[tracks.control,tracks.electronics]),
 p('MAN','Manufacturing Engineering','Manufacturing',[tracks.manufacturing,tracks.mechanical]),
 p('MSM','Materials Science & Metal Engineering','Materials',[tracks.materials]),
 p('MEC','Mechanical Engineering','Mechanical',[tracks.mechanical,tracks.manufacturing]),
 p('MDM','Mechanical Engineering - Design & Manufacturing','Mechanical',[tracks.mechanical,tracks.manufacturing,tracks.design]),
 p('MLE','Metallurgical & Materials Engineering','Materials',[tracks.materials]),
 p('MET','Metallurgical Engineering','Materials',[tracks.materials]),
 p('MME','Metallurgy and Materials Engineering','Materials',[tracks.materials]),
 p('MIN','Mining Engineering','Mining',[tracks.mining]),
 p('MNM','Mining Engineering','Mining',[tracks.mining]),
 p('PIE','Production & Industrial Engineering','Manufacturing',[tracks.manufacturing]),
 p('PRO','Production Engineering','Manufacturing',[tracks.manufacturing]),
 p('TEX','Textile Engineering','Textile',[tracks.textile]),
];

export const ENGINEERING_PROGRAM_MAP = new Map(ENGINEERING_PROGRAMS.map(x => [x.code, x]));
export const ENGINEERING_CODES = ENGINEERING_PROGRAMS.map(x => x.code);
