import type { TestQuestion, TopicDifficulty } from "@/types/domain";

type Concept = { term: string; definition: string; hint: string };
type TopicBlueprint = { difficulty?: TopicDifficulty; concepts: Concept[] };

const B: Record<string, Record<string, TopicBlueprint>> = {
  Mathematics: {
    "Number Systems": { concepts: [
      { term: "Natural numbers", definition: "Positive counting numbers such as 1, 2, 3 and so on.", hint: "Think of numbers used for counting." },
      { term: "Integers", definition: "Whole numbers that include negative numbers, zero, and positive numbers.", hint: "This set extends whole numbers below zero." },
      { term: "Rational numbers", definition: "Numbers that can be written as p/q where p and q are integers and q is not zero.", hint: "Look for a fraction of integers." },
      { term: "Irrational numbers", definition: "Real numbers that cannot be expressed as a ratio of two integers and have non-terminating, non-repeating decimals.", hint: "Their decimal expansion never settles into a repeating pattern." },
      { term: "Real numbers", definition: "The set containing both rational and irrational numbers.", hint: "It includes every point on the ordinary number line." },
    ]},
    Algebra: { concepts: [
      { term: "Variable", definition: "A symbol that represents an unknown or changeable quantity.", hint: "Usually written as x, y, or another letter." },
      { term: "Coefficient", definition: "The numerical factor multiplying a variable in a term.", hint: "In 7x, focus on the number." },
      { term: "Linear equation", definition: "An equation in which the highest power of the variable is one.", hint: "Its graph is a straight line in two variables." },
      { term: "Polynomial", definition: "An expression made from variables and coefficients using non-negative integer powers.", hint: "Terms such as 3x², -2x, and 5 can belong to one." },
      { term: "Factorisation", definition: "Rewriting an expression as a product of simpler expressions.", hint: "It reverses expansion." },
    ]},
    Geometry: { concepts: [
      { term: "Point", definition: "An exact position with no length, width, or thickness.", hint: "It marks location only." },
      { term: "Line", definition: "A straight one-dimensional figure extending infinitely in both directions.", hint: "It has no endpoints." },
      { term: "Angle", definition: "A figure formed by two rays sharing a common endpoint.", hint: "The common endpoint is the vertex." },
      { term: "Triangle", definition: "A polygon with three sides and three interior angles.", hint: "Its interior angles total 180 degrees in Euclidean geometry." },
      { term: "Circle", definition: "The set of points in a plane at a fixed distance from a center point.", hint: "That fixed distance is the radius." },
    ]},
    Trigonometry: { concepts: [
      { term: "Sine", definition: "For a right triangle, the ratio of the side opposite an angle to the hypotenuse.", hint: "SOH from SOH-CAH-TOA." },
      { term: "Cosine", definition: "For a right triangle, the ratio of the adjacent side to the hypotenuse.", hint: "CAH from SOH-CAH-TOA." },
      { term: "Tangent", definition: "For a right triangle, the ratio of the opposite side to the adjacent side.", hint: "TOA from SOH-CAH-TOA." },
      { term: "Pythagorean identity", definition: "The identity sin²θ + cos²θ = 1.", hint: "It links sine and cosine squares." },
      { term: "Complementary angles", definition: "Two angles whose measures add to 90 degrees.", hint: "Sine and cosine swap roles for these angles." },
    ]},
    Statistics: { concepts: [
      { term: "Mean", definition: "The sum of observations divided by the number of observations.", hint: "It is the arithmetic average." },
      { term: "Median", definition: "The middle value after data are arranged in order.", hint: "For an even count, average the two middle values." },
      { term: "Mode", definition: "The value that occurs most frequently in a dataset.", hint: "Look for repetition." },
      { term: "Range", definition: "The difference between the maximum and minimum observations.", hint: "Largest minus smallest." },
      { term: "Standard deviation", definition: "A measure of how spread out observations are around their mean.", hint: "Higher values generally mean greater dispersion." },
    ]},
  },
  Physics: {
    Motion: { concepts: [
      { term: "Distance", definition: "The total length of the path travelled by an object.", hint: "It is a scalar path-length quantity." },
      { term: "Displacement", definition: "The straight-line change in position from initial to final point, with direction.", hint: "It is a vector." },
      { term: "Speed", definition: "Distance travelled per unit time.", hint: "It does not include direction." },
      { term: "Velocity", definition: "Displacement per unit time, including direction.", hint: "It is the vector counterpart of speed." },
      { term: "Acceleration", definition: "The rate of change of velocity with time.", hint: "Its SI unit is m/s²." },
    ]},
    "Force and Laws of Motion": { concepts: [
      { term: "Inertia", definition: "The tendency of an object to resist a change in its state of motion.", hint: "Newton's first law is often called the law of this property." },
      { term: "Newton's first law", definition: "An object remains at rest or in uniform straight-line motion unless acted on by a net external force.", hint: "Think inertia." },
      { term: "Newton's second law", definition: "Net force equals the rate of change of momentum; for constant mass, F = ma.", hint: "Force, mass, and acceleration." },
      { term: "Newton's third law", definition: "For every action force, there is an equal and opposite reaction force.", hint: "Forces occur in interaction pairs." },
      { term: "Momentum", definition: "The product of an object's mass and velocity.", hint: "p = mv." },
    ]},
    "Work and Energy": { concepts: [
      { term: "Work", definition: "Energy transferred when a force causes displacement in the direction of its component.", hint: "For constant force, W = F s cosθ." },
      { term: "Kinetic energy", definition: "Energy an object has because of its motion.", hint: "For a non-relativistic particle, it is ½mv²." },
      { term: "Potential energy", definition: "Stored energy associated with position or configuration.", hint: "Gravitational mgh is a common example." },
      { term: "Power", definition: "The rate at which work is done or energy is transferred.", hint: "Its SI unit is watt." },
      { term: "Conservation of energy", definition: "Energy cannot be created or destroyed in an isolated system, only transformed.", hint: "Total energy remains constant in an isolated system." },
    ]},
    Electricity: { concepts: [
      { term: "Electric current", definition: "The rate of flow of electric charge.", hint: "I = Q/t." },
      { term: "Potential difference", definition: "Work done per unit charge in moving charge between two points.", hint: "Measured in volts." },
      { term: "Resistance", definition: "A measure of opposition to electric current.", hint: "Measured in ohms." },
      { term: "Ohm's law", definition: "For an ohmic conductor at constant conditions, voltage is proportional to current: V = IR.", hint: "Relates voltage, current, resistance." },
      { term: "Electric power", definition: "The rate of electrical energy transfer, commonly P = VI.", hint: "Can also be I²R or V²/R for resistive circuits." },
    ]},
    Light: { concepts: [
      { term: "Reflection", definition: "The return of light into the same medium after striking a surface.", hint: "Angle of incidence equals angle of reflection." },
      { term: "Refraction", definition: "The change in direction of light when it passes between media with different optical properties.", hint: "It is associated with a change in speed." },
      { term: "Focal point", definition: "The point at which parallel rays converge, or appear to diverge from, after an optical element.", hint: "Lenses and mirrors use this idea." },
      { term: "Convex lens", definition: "A converging lens that is thicker at the center than at the edges.", hint: "It can bring parallel rays to a real focus." },
      { term: "Refractive index", definition: "The ratio of the speed of light in vacuum to its speed in a medium.", hint: "n = c/v." },
    ]},
  },
  Chemistry: {
    "Atomic Structure": { concepts: [
      { term: "Proton", definition: "A positively charged subatomic particle found in the atomic nucleus.", hint: "Its count defines atomic number." },
      { term: "Neutron", definition: "An electrically neutral subatomic particle found in the nucleus.", hint: "It contributes to mass number but not atomic number." },
      { term: "Electron", definition: "A negatively charged subatomic particle occupying quantum states around the nucleus.", hint: "Chemical bonding largely involves these particles." },
      { term: "Atomic number", definition: "The number of protons in the nucleus of an atom.", hint: "It uniquely identifies an element." },
      { term: "Mass number", definition: "The total number of protons and neutrons in a nucleus.", hint: "Nucleons = protons + neutrons." },
    ]},
    "Chemical Bonding": { concepts: [
      { term: "Ionic bond", definition: "Electrostatic attraction between oppositely charged ions formed after electron transfer.", hint: "Common between metals and non-metals." },
      { term: "Covalent bond", definition: "A bond formed by sharing electron pairs between atoms.", hint: "Common between non-metals." },
      { term: "Metallic bond", definition: "Attraction between positive metal ions and delocalized electrons in a metallic lattice.", hint: "Helps explain electrical conductivity of metals." },
      { term: "Electronegativity", definition: "An atom's tendency to attract shared electrons in a chemical bond.", hint: "Differences help predict bond polarity." },
      { term: "Valence electrons", definition: "Electrons in the outermost occupied shell that are most involved in bonding.", hint: "These largely determine chemical reactivity." },
    ]},
    "Acids, Bases and Salts": { concepts: [
      { term: "Acid", definition: "A substance that donates protons in the Brønsted-Lowry model.", hint: "Think H+ donor." },
      { term: "Base", definition: "A substance that accepts protons in the Brønsted-Lowry model.", hint: "Think H+ acceptor." },
      { term: "pH", definition: "A logarithmic measure related to hydrogen ion activity in solution.", hint: "Lower values generally indicate greater acidity in aqueous solutions." },
      { term: "Neutralisation", definition: "A reaction in which an acid and base react, typically producing salt and water.", hint: "Acid + base is the usual pattern." },
      { term: "Salt", definition: "An ionic compound commonly formed when the replaceable hydrogen of an acid is replaced by a cation.", hint: "It can be a product of neutralisation." },
    ]},
    "Metals and Non-metals": { concepts: [
      { term: "Malleability", definition: "The ability of a material to be hammered or rolled into sheets without breaking.", hint: "A typical metallic property." },
      { term: "Ductility", definition: "The ability of a material to be drawn into wires.", hint: "Copper is a familiar example." },
      { term: "Metallic conductivity", definition: "The ability of metals to conduct electricity due to mobile delocalized electrons.", hint: "Free-moving electrons are key." },
      { term: "Oxidation", definition: "Loss of electrons or an increase in oxidation state.", hint: "Remember OIL: Oxidation Is Loss." },
      { term: "Reactivity series", definition: "An ordering of metals by their tendency to undergo oxidation and chemical reactions.", hint: "More reactive metals displace less reactive ones from suitable compounds." },
    ]},
    "Organic Chemistry": { concepts: [
      { term: "Hydrocarbon", definition: "An organic compound containing only carbon and hydrogen.", hint: "Alkanes, alkenes, and alkynes are examples." },
      { term: "Alkane", definition: "A saturated acyclic hydrocarbon containing only carbon-carbon single bonds.", hint: "General formula CnH2n+2 for open-chain members." },
      { term: "Alkene", definition: "An unsaturated hydrocarbon containing at least one carbon-carbon double bond.", hint: "The C=C bond is characteristic." },
      { term: "Functional group", definition: "A specific atom or group of atoms responsible for characteristic reactions of an organic compound.", hint: "Examples include hydroxyl and carboxyl groups." },
      { term: "Isomerism", definition: "The existence of compounds with the same molecular formula but different structures or spatial arrangements.", hint: "Same formula does not always mean same molecule." },
    ]},
  },
  Biology: {
    "Cell Biology": { concepts: [
      { term: "Cell membrane", definition: "A selectively permeable boundary controlling movement of substances into and out of the cell.", hint: "It separates cell contents from the environment." },
      { term: "Nucleus", definition: "A membrane-bound organelle in eukaryotic cells that contains most of the genetic material.", hint: "It houses chromosomes." },
      { term: "Mitochondrion", definition: "An organelle where much aerobic ATP production occurs.", hint: "Often associated with cellular respiration." },
      { term: "Ribosome", definition: "A molecular machine that synthesizes proteins by translating messenger RNA.", hint: "Protein synthesis happens here." },
      { term: "Cytoplasm", definition: "The cell contents between the plasma membrane and nucleus, including cytosol and organelles.", hint: "Many metabolic reactions occur in this region." },
    ]},
    "Human Physiology": { concepts: [
      { term: "Homeostasis", definition: "Maintenance of a relatively stable internal environment despite external changes.", hint: "Body temperature regulation is an example." },
      { term: "Circulatory system", definition: "The system that transports blood, gases, nutrients, hormones, and wastes around the body.", hint: "Heart and blood vessels are central components." },
      { term: "Respiration", definition: "The cellular process that releases usable energy from nutrients; gas exchange supports aerobic respiration.", hint: "Do not confuse cellular respiration with breathing alone." },
      { term: "Neuron", definition: "A specialized cell that transmits electrical and chemical signals in the nervous system.", hint: "It is the basic signaling cell of nervous tissue." },
      { term: "Hormone", definition: "A chemical messenger released by endocrine cells and carried to target tissues.", hint: "Endocrine signaling often travels through blood." },
    ]},
    Genetics: { concepts: [
      { term: "Gene", definition: "A DNA sequence that contributes to a functional product and can influence a trait.", hint: "It is a basic unit of heredity." },
      { term: "Allele", definition: "An alternative form of a gene at a particular locus.", hint: "Different versions of the same gene." },
      { term: "Genotype", definition: "The genetic constitution or allele combination of an organism for one or more loci.", hint: "This describes genetic makeup." },
      { term: "Phenotype", definition: "Observable characteristics resulting from genotype and environmental influences.", hint: "This is what can be observed or measured." },
      { term: "Mutation", definition: "A heritable change in genetic material or DNA sequence.", hint: "It can create new genetic variation." },
    ]},
    Ecology: { concepts: [
      { term: "Ecosystem", definition: "A community of organisms interacting with one another and with the physical environment.", hint: "It includes biotic and abiotic components." },
      { term: "Population", definition: "Individuals of the same species living in a defined area at a given time.", hint: "One species in one area." },
      { term: "Community", definition: "All populations of different species living and interacting in an area.", hint: "It contains multiple species." },
      { term: "Food chain", definition: "A simplified sequence showing transfer of energy and matter through feeding relationships.", hint: "Producer to consumers is a common pattern." },
      { term: "Biodiversity", definition: "The variety of life across genes, species, and ecosystems.", hint: "It includes more than species count alone." },
    ]},
    "Plant Biology": { concepts: [
      { term: "Photosynthesis", definition: "The process by which photoautotrophs use light energy to synthesize organic molecules from carbon dioxide and water.", hint: "Chloroplasts are central in plants." },
      { term: "Xylem", definition: "Vascular tissue that transports water and dissolved minerals mainly from roots upward.", hint: "Think water transport." },
      { term: "Phloem", definition: "Vascular tissue that transports sugars and other organic solutes between sources and sinks.", hint: "Think food/sugar transport." },
      { term: "Stomata", definition: "Microscopic pores in the epidermis that regulate gas exchange and water loss.", hint: "Guard cells control them." },
      { term: "Transpiration", definition: "Loss of water vapor from aerial plant parts, mainly through stomata.", hint: "It helps drive water movement through xylem." },
    ]},
  },
  "Computer Science": {
    "Programming Fundamentals": { concepts: [
      { term: "Variable", definition: "A named storage location or binding used to hold a value in a program.", hint: "Its value may change during execution depending on the language." },
      { term: "Conditional", definition: "A control structure that chooses which code path to execute based on a Boolean condition.", hint: "if/else is the common form." },
      { term: "Loop", definition: "A control structure that repeats a block of code while a condition or iteration rule applies.", hint: "for and while are common forms." },
      { term: "Function", definition: "A reusable unit of code that can accept inputs and may return a result.", hint: "It helps decompose a program into smaller pieces." },
      { term: "Data type", definition: "A classification describing the kind of value and operations allowed on it.", hint: "Examples include integer, string, and Boolean." },
    ]},
    "Data Structures": { concepts: [
      { term: "Array", definition: "A sequence of elements stored in indexed positions, commonly with contiguous memory in low-level implementations.", hint: "Direct indexing is a defining feature." },
      { term: "Linked list", definition: "A sequence of nodes where each node stores data and links to other nodes.", hint: "Nodes need not be contiguous in memory." },
      { term: "Stack", definition: "A last-in, first-out data structure.", hint: "Push and pop happen at the same end." },
      { term: "Queue", definition: "A first-in, first-out data structure in its standard form.", hint: "Enqueue at one end, dequeue at the other." },
      { term: "Hash table", definition: "A structure that uses a hash function to map keys to storage locations for efficient lookup on average.", hint: "Key-value dictionaries are often implemented this way." },
    ]},
    Algorithms: { concepts: [
      { term: "Algorithm", definition: "A finite, well-defined sequence of steps for solving a problem or computing a result.", hint: "It is a procedure, not a programming language." },
      { term: "Time complexity", definition: "A description of how an algorithm's running time grows with input size.", hint: "Big-O notation is commonly used." },
      { term: "Binary search", definition: "A search algorithm that repeatedly halves a sorted search interval.", hint: "Sorting or monotonic order is required for ordinary use." },
      { term: "Recursion", definition: "A technique where a function solves a problem by calling itself on smaller instances, with a base case.", hint: "A base case prevents infinite self-calls." },
      { term: "Sorting", definition: "Rearranging items according to an ordering relation such as ascending numeric order.", hint: "Merge sort and insertion sort are examples." },
    ]},
    Databases: { concepts: [
      { term: "Table", definition: "A relational structure consisting of rows and columns.", hint: "Rows represent records; columns represent attributes." },
      { term: "Primary key", definition: "An attribute or set of attributes that uniquely identifies each row in a relation.", hint: "Uniqueness is essential." },
      { term: "Foreign key", definition: "An attribute that references a candidate or primary key in another or the same table.", hint: "It represents relationships and supports referential integrity." },
      { term: "SQL", definition: "A declarative language family used to define, query, and manipulate relational data.", hint: "SELECT is a familiar command." },
      { term: "Normalization", definition: "A design process that organizes relational data to reduce undesirable redundancy and update anomalies.", hint: "It is expressed through normal forms." },
    ]},
    "Computer Networks": { concepts: [
      { term: "IP address", definition: "A logical network-layer address used to identify an interface in an IP network.", hint: "IPv4 and IPv6 are major versions." },
      { term: "Router", definition: "A device or function that forwards packets between different IP networks.", hint: "It makes forwarding decisions using routing information." },
      { term: "TCP", definition: "A connection-oriented transport protocol providing reliable ordered byte-stream delivery.", hint: "It uses acknowledgements and retransmission." },
      { term: "DNS", definition: "A distributed naming system that maps domain names to records such as IP addresses.", hint: "It helps translate human-readable hostnames." },
      { term: "HTTP", definition: "An application-layer protocol used for transferring web resources and API messages.", hint: "Browsers and web servers commonly use it." },
    ]},
  },
  English: {
    "Reading Comprehension": { concepts: [
      { term: "Main idea", definition: "The central point or most important message a passage develops.", hint: "Ask what the whole passage is mainly about." },
      { term: "Inference", definition: "A conclusion drawn from evidence and reasoning rather than directly stated wording.", hint: "Use clues from the text." },
      { term: "Context clue", definition: "Information around an unfamiliar word or phrase that helps determine its meaning.", hint: "Nearby definitions, examples, or contrasts can help." },
      { term: "Supporting detail", definition: "A fact, example, reason, or explanation that develops the main idea.", hint: "It provides evidence or elaboration." },
      { term: "Author's purpose", definition: "The writer's primary reason for creating a text, such as informing, explaining, persuading, or entertaining.", hint: "Consider what the writer wants the reader to understand or do." },
    ]},
    Grammar: { concepts: [
      { term: "Noun", definition: "A word that names a person, place, thing, or idea.", hint: "Examples include teacher, city, book, freedom." },
      { term: "Verb", definition: "A word that expresses an action, occurrence, or state of being.", hint: "It forms the core of the predicate." },
      { term: "Adjective", definition: "A word that modifies or describes a noun or pronoun.", hint: "It answers questions such as what kind or which one." },
      { term: "Adverb", definition: "A word that modifies a verb, adjective, another adverb, or sometimes a clause.", hint: "Many, but not all, end in -ly." },
      { term: "Subject-verb agreement", definition: "The grammatical requirement that a finite verb agree appropriately with its subject in number and person.", hint: "Singular subjects usually take singular verb forms." },
    ]},
    "Writing Skills": { concepts: [
      { term: "Thesis statement", definition: "A concise statement expressing the main claim or controlling idea of a piece of writing.", hint: "It guides the argument or focus." },
      { term: "Topic sentence", definition: "A sentence that states the main idea of a paragraph.", hint: "Supporting sentences should develop it." },
      { term: "Cohesion", definition: "The linguistic connections that help sentences and ideas flow together as a unified text.", hint: "Transitions and reference words contribute to it." },
      { term: "Revision", definition: "Reconsidering content, organization, clarity, and effectiveness after a draft is written.", hint: "It is broader than correcting spelling." },
      { term: "Proofreading", definition: "The final checking stage focused on surface errors such as spelling, punctuation, and formatting.", hint: "It usually follows substantive revision." },
    ]},
    Literature: { concepts: [
      { term: "Theme", definition: "A central idea or underlying meaning explored by a literary work.", hint: "It is broader than the plot." },
      { term: "Plot", definition: "The structured sequence of events and conflicts in a narrative.", hint: "It concerns what happens." },
      { term: "Characterisation", definition: "The methods a writer uses to create and develop characters.", hint: "Actions, dialogue, description, and thoughts can reveal character." },
      { term: "Setting", definition: "The time, place, and social environment in which a narrative occurs.", hint: "It can influence mood and conflict." },
      { term: "Metaphor", definition: "A figure of speech that describes one thing in terms of another without using a literal comparison marker such as 'like'.", hint: "It creates an implicit comparison." },
    ]},
    Vocabulary: { concepts: [
      { term: "Synonym", definition: "A word or expression with the same or nearly the same meaning as another in a given context.", hint: "Meaning is similar." },
      { term: "Antonym", definition: "A word with a meaning opposite to another in a given context.", hint: "Meaning contrasts." },
      { term: "Prefix", definition: "A morpheme attached to the beginning of a base or root to modify meaning.", hint: "un- and re- are common examples." },
      { term: "Suffix", definition: "A morpheme attached to the end of a base or root to change meaning or grammatical function.", hint: "-ness and -able are examples." },
      { term: "Denotation", definition: "The direct or dictionary meaning of a word, distinguished from associated connotations.", hint: "Think literal lexical meaning." },
    ]},
  },
  Accountancy: {
    "Journal Entries": { concepts: [
      { term: "Journal", definition: "The book of original entry in which transactions are first recorded chronologically.", hint: "It records debit and credit aspects before posting." },
      { term: "Debit", definition: "The left side of an account under double-entry bookkeeping.", hint: "It is not automatically equivalent to decrease." },
      { term: "Credit", definition: "The right side of an account under double-entry bookkeeping.", hint: "It is not automatically equivalent to increase." },
      { term: "Narration", definition: "A brief explanation written below a journal entry describing the transaction.", hint: "It explains why the entry was passed." },
      { term: "Compound entry", definition: "A journal entry involving more than two accounts.", hint: "It can contain multiple debits or credits." },
    ]},
    Ledger: { concepts: [
      { term: "Ledger", definition: "The principal book in which journal entries are classified and posted into individual accounts.", hint: "It groups transactions account-wise." },
      { term: "Posting", definition: "The process of transferring journal information to appropriate ledger accounts.", hint: "Journal to ledger." },
      { term: "Balance", definition: "The difference between total debits and total credits of an account at a point in time.", hint: "It can be debit or credit depending on the account." },
      { term: "Folio", definition: "A reference number used to cross-reference entries between books or pages.", hint: "It helps trace postings." },
      { term: "T-account", definition: "A simplified visual representation of an account with debit on the left and credit on the right.", hint: "Its shape resembles the letter T." },
    ]},
    "Trial Balance": { concepts: [
      { term: "Trial balance", definition: "A statement listing ledger account balances to test the arithmetic equality of debits and credits.", hint: "Equal totals do not prove that every error is absent." },
      { term: "Debit balance", definition: "An account balance where debit entries exceed credit entries.", hint: "Assets and expenses commonly have this normal balance." },
      { term: "Credit balance", definition: "An account balance where credit entries exceed debit entries.", hint: "Liabilities, capital, and income commonly have this normal balance." },
      { term: "Error of omission", definition: "An error where a transaction is wholly or partly left unrecorded.", hint: "Complete omission may not disturb trial-balance equality." },
      { term: "Suspense account", definition: "A temporary account used while differences or unidentified entries are being investigated.", hint: "It is cleared when the underlying issue is resolved." },
    ]},
    "Financial Statements": { concepts: [
      { term: "Income statement", definition: "A statement reporting income, expenses, and resulting profit or loss for a period.", hint: "It measures performance over time." },
      { term: "Balance sheet", definition: "A statement presenting assets, liabilities, and equity at a specific date.", hint: "It is a point-in-time statement." },
      { term: "Revenue", definition: "Income arising from ordinary activities of an entity before deducting related expenses.", hint: "Sales or service income can be examples." },
      { term: "Expense", definition: "A decrease in economic benefits during a period through outflows, consumption of assets, or incurrence of liabilities, excluding distributions to owners.", hint: "It reduces profit, all else equal." },
      { term: "Equity", definition: "The residual interest in assets after deducting liabilities.", hint: "Assets minus liabilities." },
    ]},
    Depreciation: { concepts: [
      { term: "Depreciation", definition: "Systematic allocation of the depreciable amount of an asset over its useful life.", hint: "It is an allocation process, not simply market-value decline." },
      { term: "Useful life", definition: "The period or units of production over which an asset is expected to be available for use by an entity.", hint: "Depreciation is allocated across this span." },
      { term: "Residual value", definition: "The estimated amount obtainable from disposal at the end of useful life after disposal costs, under the relevant assumptions.", hint: "It is considered when determining depreciable amount." },
      { term: "Straight-line method", definition: "A depreciation method that allocates an equal amount in each period when residual value and useful life assumptions remain unchanged.", hint: "Annual charge is typically constant." },
      { term: "Written-down value method", definition: "A method that applies a depreciation rate to the asset's carrying amount, producing declining charges over time.", hint: "Also called reducing-balance in many contexts." },
    ]},
  },
  Economics: {
    "Demand and Supply": { concepts: [
      { term: "Demand", definition: "The quantity of a good or service consumers are willing and able to purchase at various prices over a period, other things equal.", hint: "Willingness alone is not enough; ability to pay matters." },
      { term: "Supply", definition: "The quantity producers are willing and able to offer for sale at various prices over a period, other things equal.", hint: "Think seller behavior." },
      { term: "Equilibrium", definition: "A market condition where quantity demanded equals quantity supplied at the prevailing price.", hint: "It is the intersection of demand and supply in a simple model." },
      { term: "Elasticity", definition: "A measure of responsiveness of one economic variable to a change in another.", hint: "Price elasticity of demand is a common example." },
      { term: "Substitute goods", definition: "Goods for which an increase in the price of one tends to increase demand for the other, other things equal.", hint: "Consumers can switch between them." },
    ]},
    "Market Structures": { concepts: [
      { term: "Perfect competition", definition: "A model with many price-taking firms, homogeneous products, and low barriers to entry and exit.", hint: "Individual firms have negligible market power in the model." },
      { term: "Monopoly", definition: "A market structure dominated by a single seller with significant barriers to entry and no close substitute in the simplified model.", hint: "One seller is the defining textbook feature." },
      { term: "Monopolistic competition", definition: "A structure with many firms selling differentiated products and relatively free entry and exit.", hint: "Product differentiation matters." },
      { term: "Oligopoly", definition: "A market structure with a small number of strategically interdependent firms.", hint: "Each major firm's decisions can affect rivals." },
      { term: "Barrier to entry", definition: "A condition that makes it difficult or costly for new firms to enter a market.", hint: "Patents, scale economies, or regulation can create barriers." },
    ]},
    "National Income": { concepts: [
      { term: "GDP", definition: "The market value of final goods and services produced within a country's borders during a specified period.", hint: "Location of production is central." },
      { term: "GNP", definition: "A measure based on production or income attributable to a country's residents, adjusting domestic product for net factor income from abroad in traditional terminology.", hint: "Resident ownership/income is central rather than production location alone." },
      { term: "Nominal GDP", definition: "GDP valued at current-period prices.", hint: "It includes effects of both output and price changes." },
      { term: "Real GDP", definition: "GDP adjusted to remove the effect of changes in the general price level using constant prices or a volume measure.", hint: "It is useful for comparing output across time." },
      { term: "Per capita income", definition: "An aggregate income measure divided by the population, used as an average indicator.", hint: "It does not show the distribution of income." },
    ]},
    "Money and Banking": { concepts: [
      { term: "Money", definition: "An asset generally accepted as a medium of exchange and commonly serving as unit of account and store of value.", hint: "It reduces the need for barter." },
      { term: "Commercial bank", definition: "A financial institution that accepts deposits and provides loans and payment services, subject to regulation.", hint: "Deposits and credit creation are central textbook roles." },
      { term: "Central bank", definition: "The institution responsible for key monetary and financial-system functions such as currency issue, monetary policy, and banking-system oversight, depending on jurisdiction.", hint: "It stands at the center of the monetary system." },
      { term: "Interest rate", definition: "The price of borrowing funds or return for lending/saving, usually expressed as a percentage over time.", hint: "It affects borrowing and saving incentives." },
      { term: "Inflation", definition: "A sustained increase in the general price level, reducing purchasing power of money all else equal.", hint: "It concerns broad prices, not just one product." },
    ]},
    "Public Finance": { concepts: [
      { term: "Tax", definition: "A compulsory payment imposed by government without a direct one-to-one exchange for a specific service.", hint: "It finances public expenditure." },
      { term: "Direct tax", definition: "A tax imposed directly on income, wealth, or another tax base of the person legally responsible for paying it.", hint: "Income tax is a familiar example." },
      { term: "Indirect tax", definition: "A tax levied on transactions, goods, or services that can often be shifted through prices.", hint: "Consumption taxes are common examples." },
      { term: "Fiscal deficit", definition: "A measure of the excess of government expenditure over non-borrowed receipts during a period, according to the applicable fiscal definition.", hint: "It indicates a borrowing requirement under standard formulations." },
      { term: "Public debt", definition: "Outstanding borrowing obligations of the government accumulated over time.", hint: "Deficits can add to it." },
    ]},
  },
};

function rotate<T>(items: T[], index: number) {
  return [...items.slice(index), ...items.slice(0, index)];
}

export function buildQuestions(subjectId: string, topicId: string, subjectName: string, topicName: string): TestQuestion[] {
  const blueprint = B[subjectName]?.[topicName];
  if (!blueprint || blueprint.concepts.length < 4) return [];
  const terms = blueprint.concepts.map((item) => item.term);
  const questions: TestQuestion[] = [];

  blueprint.concepts.forEach((concept, index) => {
    const options = rotate(terms, index).slice(0, 4);
    if (!options.includes(concept.term)) options[3] = concept.term;
    const mixed = rotate(options, index % 4);
    questions.push({
      id: `${subjectName}:${topicName}:term:${index}`,
      subjectId,
      topicId,
      difficulty: blueprint.difficulty ?? "medium",
      question: `Which term best matches this description? ${concept.definition}`,
      options: mixed,
      correctOption: mixed.indexOf(concept.term),
      explanation: `${concept.term}: ${concept.definition}`,
      revisionHint: concept.hint,
    });
  });

  blueprint.concepts.forEach((concept, index) => {
    const definitionOptions = rotate(blueprint.concepts, index).slice(0, 4).map((item) => item.definition);
    if (!definitionOptions.includes(concept.definition)) definitionOptions[3] = concept.definition;
    const mixed = rotate(definitionOptions, (index + 1) % 4);
    questions.push({
      id: `${subjectName}:${topicName}:definition:${index}`,
      subjectId,
      topicId,
      difficulty: blueprint.difficulty ?? "medium",
      question: `Which statement correctly describes “${concept.term}”?`,
      options: mixed,
      correctOption: mixed.indexOf(concept.definition),
      explanation: `${concept.term}: ${concept.definition}`,
      revisionHint: concept.hint,
    });
  });

  return questions.slice(0, 10);
}

export function hasQuestionSupport(subjectName: string, topicName: string) {
  return Boolean(B[subjectName]?.[topicName]);
}

export interface TopicConcept {
  term: string;
  definition: string;
  hint: string;
}

export function getTopicConcepts(subjectName: string, topicName: string): TopicConcept[] {
  return B[subjectName]?.[topicName]?.concepts.map((concept) => ({ ...concept })) ?? [];
}
