export const PLACE_TABLE_A_TYPES = [
  "acai_shop",
  "accounting",
  "amusement_center",
  "art_gallery",
  "art_studio",
  "association_or_organization",
  "auto_parts_store",
  "bakery",
  "banquet_hall",
  "bar",
  "barber_shop",
  "beautician",
  "beauty_salon",
  "bicycle_store",
  "body_art_service",
  "book_store",
  "bowling_alley",
  "brewery",
  "buffet_restaurant",
  "building_materials_store",
  "butcher_shop",
  "cafe",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "catering_service",
  "cell_phone_store",
  "cemetery",
  "child_care_agency",
  "chiropractor",
  "church",
  "clothing_store",
  "coffee_shop",
  "confectionery",
  "consultant",
  "convenience_store",
  "cosmetics_store",
  "courier_service",
  "coworking_space",
  "dental_clinic",
  "dentist",
  "doctor",
  "electrician",
  "electronics_store",
  "employment_agency",
  "event_venue",
  "farm",
  "fitness_center",
  "florist",
  "food_delivery",
  "food_store",
  "funeral_home",
  "furniture_store",
  "garden_center",
  "gift_shop",
  "grocery_store",
  "gym",
  "hair_salon",
  "hamburger_restaurant",
  "hardware_store",
  "health_food_store",
  "home_goods_store",
  "home_improvement_store",
  "hostel",
  "hotel",
  "ice_cream_shop",
  "indoor_playground",
  "inn",
  "insurance_agency",
  "italian_restaurant",
  "japanese_restaurant",
  "jewelry_store",
  "karaoke",
  "laundry",
  "lawyer",
  "liquor_store",
  "live_music_venue",
  "locksmith",
  "lodging",
  "makeup_artist",
  "manufacturer",
  "marketing_consultant",
  "massage",
  "meal_takeaway",
  "medical_clinic",
  "medical_lab",
  "mexican_restaurant",
  "moving_company",
  "nail_salon",
  "non_profit_organization",
  "painter",
  "paintball_center",
  "pet_boarding_service",
  "pet_care",
  "pet_store",
  "pharmacy",
  "physiotherapist",
  "pizza_restaurant",
  "plumber",
  "preschool",
  "pub",
  "ranch",
  "real_estate_agency",
  "resort_hotel",
  "restaurant",
  "roofing_contractor",
  "school",
  "shipping_service",
  "shoe_store",
  "skin_care_clinic",
  "snack_bar",
  "spa",
  "sporting_goods_store",
  "sports_club",
  "sports_coaching",
  "sports_complex",
  "sports_school",
  "sportswear_store",
  "steak_house",
  "storage",
  "store",
  "supermarket",
  "supplier",
  "swimming_pool",
  "tailor",
  "telecommunications_service_provider",
  "thrift_store",
  "tire_shop",
  "tour_agency",
  "tourist_information_center",
  "toy_store",
  "transportation_service",
  "travel_agency",
  "university",
  "vegan_restaurant",
  "vegetarian_restaurant",
  "veterinary_care",
  "video_arcade",
  "wedding_venue",
  "wellness_center",
  "wholesaler",
  "womens_clothing_store",
  "yoga_studio",
] as const

export type PlaceTableAType = (typeof PLACE_TABLE_A_TYPES)[number]

const PLACE_TABLE_A_TYPE_SET = new Set<string>(PLACE_TABLE_A_TYPES)

export function isPlaceTableAType(value: string): value is PlaceTableAType {
  return PLACE_TABLE_A_TYPE_SET.has(value)
}

export const PROSPECT_SEGMENTS = [
  // Alimentação
  { id: "bakery", includedType: "bakery", label: "Padaria" },
  { id: "restaurant", includedType: "restaurant", label: "Restaurante" },
  { id: "pizzeria", includedType: "pizza_restaurant", label: "Pizzaria" },
  {
    id: "hamburger_restaurant",
    includedType: "hamburger_restaurant",
    label: "Hamburgueria",
  },
  { id: "snack_bar", includedType: "snack_bar", label: "Lanchonete" },
  { id: "coffee_shop", includedType: "cafe", label: "Cafeteria" },
  { id: "confectionery", includedType: "confectionery", label: "Confeitaria" },
  { id: "ice_cream_shop", includedType: "ice_cream_shop", label: "Sorveteria" },
  { id: "acai_shop", includedType: "acai_shop", label: "Açaíteria" },
  { id: "bar", includedType: "bar", label: "Bar" },
  { id: "pub", includedType: "pub", label: "Pub" },
  { id: "brewery", includedType: "brewery", label: "Cervejaria" },
  { id: "steakhouse", includedType: "steak_house", label: "Churrascaria" },
  {
    id: "japanese_restaurant",
    includedType: "japanese_restaurant",
    label: "Restaurante japonês",
  },
  {
    id: "italian_restaurant",
    includedType: "italian_restaurant",
    label: "Restaurante italiano",
  },
  {
    id: "mexican_restaurant",
    includedType: "mexican_restaurant",
    label: "Restaurante mexicano",
  },
  {
    id: "vegan_restaurant",
    includedType: "vegan_restaurant",
    label: "Restaurante vegano",
  },
  {
    id: "vegetarian_restaurant",
    includedType: "vegetarian_restaurant",
    label: "Restaurante vegetariano",
  },
  {
    id: "buffet_restaurant",
    includedType: "buffet_restaurant",
    label: "Restaurante self-service",
  },
  {
    id: "food_delivery",
    includedType: "food_delivery",
    label: "Delivery de comida",
  },
  { id: "marmitaria", includedType: "meal_takeaway", label: "Marmitaria" },
  { id: "meal_prep", includedType: "meal_takeaway", label: "Marmitas fitness" },
  { id: "catering", includedType: "catering_service", label: "Buffet e catering" },
  {
    id: "party_buffet",
    includedType: "catering_service",
    label: "Buffet para festas",
  },
  { id: "food_truck", includedType: "restaurant", label: "Food truck" },
  { id: "butcher_shop", includedType: "butcher_shop", label: "Açougue" },
  { id: "fish_market", includedType: "food_store", label: "Peixaria" },
  { id: "wine_store", includedType: "liquor_store", label: "Adega" },
  { id: "liquor_store", includedType: "liquor_store", label: "Loja de bebidas" },
  {
    id: "natural_food_store",
    includedType: "health_food_store",
    label: "Loja de produtos naturais",
  },
  {
    id: "supplement_store",
    includedType: "health_food_store",
    label: "Loja de suplementos",
  },

  // Saúde
  { id: "medical_clinic", includedType: "medical_clinic", label: "Clínica médica" },
  { id: "doctor", includedType: "doctor", label: "Médico" },
  { id: "dentist", includedType: "dentist", label: "Dentista" },
  {
    id: "dental_clinic",
    includedType: "dental_clinic",
    label: "Clínica odontológica",
  },
  { id: "orthodontist", includedType: "dentist", label: "Ortodontista" },
  { id: "implant_dentist", includedType: "dentist", label: "Implantodontista" },
  { id: "pediatric_dentist", includedType: "dentist", label: "Odontopediatra" },
  { id: "dermatologist", includedType: "doctor", label: "Dermatologista" },
  { id: "cardiologist", includedType: "doctor", label: "Cardiologista" },
  { id: "gynecologist", includedType: "doctor", label: "Ginecologista" },
  { id: "pediatrician", includedType: "doctor", label: "Pediatra" },
  { id: "orthopedist", includedType: "doctor", label: "Ortopedista" },
  { id: "neurologist", includedType: "doctor", label: "Neurologista" },
  { id: "psychiatrist", includedType: "doctor", label: "Psiquiatra" },
  { id: "ophthalmologist", includedType: "doctor", label: "Oftalmologista" },
  {
    id: "otolaryngologist",
    includedType: "doctor",
    label: "Otorrinolaringologista",
  },
  { id: "urologist", includedType: "doctor", label: "Urologista" },
  { id: "endocrinologist", includedType: "doctor", label: "Endocrinologista" },
  { id: "gastroenterologist", includedType: "doctor", label: "Gastroenterologista" },
  { id: "pulmonologist", includedType: "doctor", label: "Pneumologista" },
  { id: "rheumatologist", includedType: "doctor", label: "Reumatologista" },
  { id: "vascular_surgeon", includedType: "doctor", label: "Cirurgião vascular" },
  { id: "plastic_surgeon", includedType: "doctor", label: "Cirurgião plástico" },
  { id: "nutritionist", includedType: "wellness_center", label: "Nutricionista" },
  { id: "psychologist", includedType: "doctor", label: "Psicólogo" },
  {
    id: "psychotherapy_clinic",
    includedType: "medical_clinic",
    label: "Clínica de psicologia",
  },
  {
    id: "physiotherapist",
    includedType: "physiotherapist",
    label: "Fisioterapeuta",
  },
  {
    id: "physiotherapy_clinic",
    includedType: "physiotherapist",
    label: "Clínica de fisioterapia",
  },
  { id: "speech_therapist", includedType: "doctor", label: "Fonoaudiólogo" },
  {
    id: "occupational_therapist",
    includedType: "doctor",
    label: "Terapeuta ocupacional",
  },
  { id: "chiropractor", includedType: "chiropractor", label: "Quiropraxista" },
  { id: "osteopath", includedType: "chiropractor", label: "Osteopata" },
  {
    id: "acupuncture_clinic",
    includedType: "wellness_center",
    label: "Clínica de acupuntura",
  },
  {
    id: "biomedicine_clinic",
    includedType: "medical_clinic",
    label: "Clínica de biomedicina",
  },
  {
    id: "biomedical_professional",
    includedType: "medical_clinic",
    label: "Biomédico",
  },
  {
    id: "clinical_analysis_lab",
    includedType: "medical_lab",
    label: "Laboratório de análises clínicas",
  },
  {
    id: "diagnostic_imaging",
    includedType: "medical_lab",
    label: "Clínica de diagnóstico por imagem",
  },
  {
    id: "radiology_clinic",
    includedType: "medical_lab",
    label: "Clínica de radiologia",
  },
  {
    id: "vaccination_clinic",
    includedType: "medical_clinic",
    label: "Clínica de vacinação",
  },
  { id: "home_care", includedType: "medical_clinic", label: "Home care" },
  {
    id: "elderly_care",
    includedType: "medical_clinic",
    label: "Cuidados para idosos",
  },
  { id: "nursing_home", includedType: "medical_clinic", label: "Casa de repouso" },
  {
    id: "hearing_aid_store",
    includedType: "store",
    label: "Aparelhos auditivos",
  },
  {
    id: "orthopedic_store",
    includedType: "store",
    label: "Loja de produtos ortopédicos",
  },
  { id: "optical_store", includedType: "store", label: "Ótica" },
  { id: "pharmacy", includedType: "pharmacy", label: "Farmácia" },
  {
    id: "compounding_pharmacy",
    includedType: "pharmacy",
    label: "Farmácia de manipulação",
  },

  // Estética e beleza
  { id: "beauty_salon", includedType: "beauty_salon", label: "Salão de beleza" },
  { id: "hair_salon", includedType: "hair_salon", label: "Salão de cabelo" },
  { id: "barbershop", includedType: "barber_shop", label: "Barbearia" },
  { id: "nail_salon", includedType: "nail_salon", label: "Manicure e pedicure" },
  { id: "nail_designer", includedType: "nail_salon", label: "Nail designer" },
  {
    id: "eyebrow_designer",
    includedType: "beautician",
    label: "Designer de sobrancelhas",
  },
  {
    id: "eyelash_extension",
    includedType: "beautician",
    label: "Extensão de cílios",
  },
  { id: "makeup_artist", includedType: "makeup_artist", label: "Maquiador" },
  { id: "beautician", includedType: "beautician", label: "Esteticista" },
  {
    id: "aesthetic_clinic",
    includedType: "skin_care_clinic",
    label: "Clínica de estética",
  },
  {
    id: "facial_aesthetics",
    includedType: "skin_care_clinic",
    label: "Estética facial",
  },
  {
    id: "body_aesthetics",
    includedType: "skin_care_clinic",
    label: "Estética corporal",
  },
  {
    id: "advanced_aesthetics",
    includedType: "skin_care_clinic",
    label: "Estética avançada",
  },
  {
    id: "laser_hair_removal",
    includedType: "skin_care_clinic",
    label: "Depilação a laser",
  },
  { id: "waxing_salon", includedType: "beautician", label: "Depilação" },
  {
    id: "hair_transplant_clinic",
    includedType: "medical_clinic",
    label: "Transplante capilar",
  },
  { id: "spa", includedType: "spa", label: "Spa" },
  { id: "massage_therapist", includedType: "massage", label: "Massoterapeuta" },
  { id: "massage_clinic", includedType: "massage", label: "Clínica de massagem" },
  {
    id: "tattoo_studio",
    includedType: "body_art_service",
    label: "Estúdio de tatuagem",
  },
  {
    id: "piercing_studio",
    includedType: "body_art_service",
    label: "Estúdio de piercing",
  },
  {
    id: "permanent_makeup",
    includedType: "makeup_artist",
    label: "Micropigmentação",
  },
  {
    id: "beauty_products_store",
    includedType: "cosmetics_store",
    label: "Loja de cosméticos",
  },

  // Fitness, esporte e bem-estar
  { id: "gym", includedType: "gym", label: "Academia" },
  {
    id: "personal_trainer",
    includedType: "sports_coaching",
    label: "Personal trainer",
  },
  { id: "crossfit_gym", includedType: "gym", label: "CrossFit" },
  { id: "functional_training", includedType: "gym", label: "Treinamento funcional" },
  {
    id: "pilates_studio",
    includedType: "fitness_center",
    label: "Estúdio de Pilates",
  },
  { id: "yoga_studio", includedType: "yoga_studio", label: "Estúdio de Yoga" },
  { id: "dance_school", includedType: "sports_school", label: "Escola de dança" },
  {
    id: "martial_arts_school",
    includedType: "sports_school",
    label: "Academia de artes marciais",
  },
  {
    id: "jiu_jitsu_gym",
    includedType: "sports_school",
    label: "Academia de Jiu-Jitsu",
  },
  { id: "boxing_gym", includedType: "gym", label: "Academia de boxe" },
  {
    id: "swimming_school",
    includedType: "swimming_pool",
    label: "Escola de natação",
  },
  {
    id: "soccer_school",
    includedType: "sports_school",
    label: "Escolinha de futebol",
  },
  { id: "sports_club", includedType: "sports_club", label: "Clube esportivo" },
  {
    id: "sports_center",
    includedType: "sports_complex",
    label: "Centro esportivo",
  },
  {
    id: "sports_store",
    includedType: "sporting_goods_store",
    label: "Loja de artigos esportivos",
  },
  { id: "bike_shop", includedType: "bicycle_store", label: "Loja de bicicletas" },

  // Advocacia e jurídico
  { id: "lawyer", includedType: "lawyer", label: "Advogado" },
  { id: "law_firm", includedType: "lawyer", label: "Escritório de advocacia" },
  { id: "labor_lawyer", includedType: "lawyer", label: "Advogado trabalhista" },
  { id: "family_lawyer", includedType: "lawyer", label: "Advogado de família" },
  { id: "criminal_lawyer", includedType: "lawyer", label: "Advogado criminalista" },
  { id: "civil_lawyer", includedType: "lawyer", label: "Advogado cível" },
  { id: "tax_lawyer", includedType: "lawyer", label: "Advogado tributário" },
  { id: "business_lawyer", includedType: "lawyer", label: "Advogado empresarial" },
  {
    id: "real_estate_lawyer",
    includedType: "lawyer",
    label: "Advogado imobiliário",
  },
  {
    id: "social_security_lawyer",
    includedType: "lawyer",
    label: "Advogado previdenciário",
  },
  {
    id: "consumer_lawyer",
    includedType: "lawyer",
    label: "Advogado do consumidor",
  },
  {
    id: "digital_lawyer",
    includedType: "lawyer",
    label: "Advogado de direito digital",
  },
  {
    id: "immigration_lawyer",
    includedType: "lawyer",
    label: "Advogado de imigração",
  },
  { id: "notary_office", includedType: "consultant", label: "Cartório" },
  {
    id: "mediation_service",
    includedType: "lawyer",
    label: "Mediação e arbitragem",
  },

  // Contabilidade, financeiro e negócios
  { id: "accounting", includedType: "accounting", label: "Contabilidade" },
  { id: "accountant", includedType: "accounting", label: "Contador" },
  {
    id: "financial_advisor",
    includedType: "consultant",
    label: "Consultor financeiro",
  },
  {
    id: "financial_planning",
    includedType: "consultant",
    label: "Planejamento financeiro",
  },
  {
    id: "investment_advisor",
    includedType: "consultant",
    label: "Assessor de investimentos",
  },
  {
    id: "insurance_broker",
    includedType: "insurance_agency",
    label: "Corretora de seguros",
  },
  {
    id: "insurance_agent",
    includedType: "insurance_agency",
    label: "Corretor de seguros",
  },
  {
    id: "business_consulting",
    includedType: "consultant",
    label: "Consultoria empresarial",
  },
  {
    id: "management_consulting",
    includedType: "consultant",
    label: "Consultoria de gestão",
  },
  { id: "hr_consulting", includedType: "consultant", label: "Consultoria de RH" },
  {
    id: "recruitment_agency",
    includedType: "employment_agency",
    label: "Agência de recrutamento",
  },
  {
    id: "business_broker",
    includedType: "consultant",
    label: "Corretor de empresas",
  },
  {
    id: "franchise_consulting",
    includedType: "consultant",
    label: "Consultoria de franquias",
  },
  { id: "coworking_space", includedType: "coworking_space", label: "Coworking" },

  // Engenharia, arquitetura e construção
  {
    id: "engineering_company",
    includedType: "consultant",
    label: "Empresa de engenharia",
  },
  { id: "civil_engineer", includedType: "consultant", label: "Engenheiro civil" },
  {
    id: "electrical_engineer",
    includedType: "electrician",
    label: "Engenheiro elétrico",
  },
  {
    id: "mechanical_engineer",
    includedType: "consultant",
    label: "Engenheiro mecânico",
  },
  {
    id: "environmental_engineer",
    includedType: "consultant",
    label: "Engenheiro ambiental",
  },
  {
    id: "automation_engineer",
    includedType: "consultant",
    label: "Engenharia de automação",
  },
  {
    id: "structural_engineer",
    includedType: "consultant",
    label: "Engenheiro estrutural",
  },
  { id: "architect", includedType: "consultant", label: "Arquiteto" },
  {
    id: "architecture_firm",
    includedType: "consultant",
    label: "Escritório de arquitetura",
  },
  {
    id: "interior_designer",
    includedType: "consultant",
    label: "Designer de interiores",
  },
  {
    id: "construction_company",
    includedType: "roofing_contractor",
    label: "Construtora",
  },
  {
    id: "real_estate_developer",
    includedType: "real_estate_agency",
    label: "Incorporadora",
  },
  {
    id: "general_contractor",
    includedType: "roofing_contractor",
    label: "Empreiteira",
  },
  { id: "masonry_service", includedType: "roofing_contractor", label: "Pedreiro" },
  { id: "painting_service", includedType: "painter", label: "Pintor" },
  { id: "electrician", includedType: "electrician", label: "Eletricista" },
  { id: "plumber", includedType: "plumber", label: "Encanador" },
  { id: "locksmith", includedType: "locksmith", label: "Chaveiro" },
  { id: "carpenter", includedType: "furniture_store", label: "Marceneiro" },
  { id: "carpentry_shop", includedType: "furniture_store", label: "Marcenaria" },
  { id: "metalwork", includedType: "manufacturer", label: "Serralheria" },
  {
    id: "glass_shop",
    includedType: "home_improvement_store",
    label: "Vidraçaria",
  },
  { id: "roofing_service", includedType: "roofing_contractor", label: "Telhadista" },
  {
    id: "waterproofing_service",
    includedType: "roofing_contractor",
    label: "Impermeabilização",
  },
  {
    id: "flooring_service",
    includedType: "home_improvement_store",
    label: "Pisos e revestimentos",
  },
  {
    id: "drywall_service",
    includedType: "home_improvement_store",
    label: "Drywall",
  },
  {
    id: "ceiling_service",
    includedType: "home_improvement_store",
    label: "Forros e gesso",
  },
  { id: "solar_energy", includedType: "electrician", label: "Energia solar" },
  {
    id: "solar_panel_installer",
    includedType: "electrician",
    label: "Instalação de painéis solares",
  },
  { id: "air_conditioning", includedType: "electrician", label: "Ar-condicionado" },
  {
    id: "hvac_service",
    includedType: "electrician",
    label: "Climatização e HVAC",
  },
  {
    id: "pool_construction",
    includedType: "swimming_pool",
    label: "Construção de piscinas",
  },
  {
    id: "pool_maintenance",
    includedType: "swimming_pool",
    label: "Manutenção de piscinas",
  },
  { id: "landscaping", includedType: "garden_center", label: "Paisagismo" },
  { id: "gardening_service", includedType: "garden_center", label: "Jardinagem" },

  // Imobiliário
  {
    id: "real_estate_agency",
    includedType: "real_estate_agency",
    label: "Imobiliária",
  },
  {
    id: "real_estate_agent",
    includedType: "real_estate_agency",
    label: "Corretor de imóveis",
  },
  {
    id: "property_management",
    includedType: "real_estate_agency",
    label: "Administradora de imóveis",
  },
  {
    id: "condominium_management",
    includedType: "real_estate_agency",
    label: "Administradora de condomínios",
  },
  {
    id: "property_appraiser",
    includedType: "real_estate_agency",
    label: "Avaliador de imóveis",
  },
  { id: "surveying_company", includedType: "consultant", label: "Topografia" },
  { id: "land_surveyor", includedType: "consultant", label: "Topógrafo" },

  // Casa, móveis e decoração
  { id: "furniture_store", includedType: "furniture_store", label: "Loja de móveis" },
  {
    id: "planned_furniture",
    includedType: "furniture_store",
    label: "Móveis planejados",
  },
  { id: "mattress_store", includedType: "furniture_store", label: "Loja de colchões" },
  {
    id: "home_decor_store",
    includedType: "home_goods_store",
    label: "Loja de decoração",
  },
  {
    id: "lighting_store",
    includedType: "home_goods_store",
    label: "Loja de iluminação",
  },
  {
    id: "curtain_store",
    includedType: "home_goods_store",
    label: "Cortinas e persianas",
  },
  {
    id: "carpet_store",
    includedType: "home_goods_store",
    label: "Tapetes e carpetes",
  },
  {
    id: "building_materials",
    includedType: "building_materials_store",
    label: "Loja de materiais de construção",
  },
  {
    id: "hardware_store",
    includedType: "hardware_store",
    label: "Loja de ferragens",
  },
  { id: "paint_store", includedType: "hardware_store", label: "Loja de tintas" },
  {
    id: "tile_store",
    includedType: "home_improvement_store",
    label: "Loja de pisos e revestimentos",
  },
  { id: "kitchen_store", includedType: "furniture_store", label: "Loja de cozinhas" },

  // Automotivo
  { id: "car_repair", includedType: "car_repair", label: "Oficina mecânica" },
  { id: "auto_electrician", includedType: "car_repair", label: "Autoelétrica" },
  { id: "auto_body_shop", includedType: "car_repair", label: "Funilaria e pintura" },
  { id: "car_detailing", includedType: "car_wash", label: "Estética automotiva" },
  { id: "car_wash", includedType: "car_wash", label: "Lava-rápido" },
  { id: "tire_shop", includedType: "tire_shop", label: "Loja de pneus" },
  {
    id: "wheel_alignment",
    includedType: "car_repair",
    label: "Alinhamento e balanceamento",
  },
  { id: "auto_parts_store", includedType: "auto_parts_store", label: "Autopeças" },
  {
    id: "car_audio_store",
    includedType: "auto_parts_store",
    label: "Som automotivo",
  },
  {
    id: "auto_accessories",
    includedType: "auto_parts_store",
    label: "Acessórios automotivos",
  },
  { id: "car_dealership", includedType: "car_dealer", label: "Concessionária" },
  {
    id: "used_car_dealer",
    includedType: "car_dealer",
    label: "Loja de veículos seminovos",
  },
  {
    id: "motorcycle_dealer",
    includedType: "car_dealer",
    label: "Loja de motocicletas",
  },
  { id: "motorcycle_repair", includedType: "car_repair", label: "Oficina de motos" },
  { id: "car_rental", includedType: "car_rental", label: "Locadora de veículos" },
  {
    id: "vehicle_tracking",
    includedType: "consultant",
    label: "Rastreamento veicular",
  },
  {
    id: "vehicle_inspection",
    includedType: "car_repair",
    label: "Vistoria veicular",
  },
  { id: "driving_school", includedType: "school", label: "Autoescola" },
  { id: "towing_service", includedType: "car_repair", label: "Guincho" },

  // Pets e veterinária
  { id: "pet_store", includedType: "pet_store", label: "Pet shop" },
  { id: "veterinary_care", includedType: "veterinary_care", label: "Veterinário" },
  {
    id: "veterinary_clinic",
    includedType: "veterinary_care",
    label: "Clínica veterinária",
  },
  {
    id: "veterinary_hospital",
    includedType: "veterinary_care",
    label: "Hospital veterinário",
  },
  { id: "pet_grooming", includedType: "pet_care", label: "Banho e tosa" },
  { id: "pet_hotel", includedType: "pet_boarding_service", label: "Hotel para pets" },
  {
    id: "pet_daycare",
    includedType: "pet_boarding_service",
    label: "Creche para pets",
  },
  { id: "dog_trainer", includedType: "pet_care", label: "Adestrador" },
  { id: "pet_sitter", includedType: "pet_care", label: "Pet sitter" },
  { id: "pet_breeder", includedType: "pet_store", label: "Criador de animais" },

  // Educação
  { id: "school", includedType: "school", label: "Escola" },
  { id: "preschool", includedType: "preschool", label: "Pré-escola" },
  { id: "daycare", includedType: "child_care_agency", label: "Creche" },
  { id: "private_school", includedType: "school", label: "Escola particular" },
  { id: "language_school", includedType: "school", label: "Escola de idiomas" },
  { id: "english_school", includedType: "school", label: "Escola de inglês" },
  { id: "music_school", includedType: "school", label: "Escola de música" },
  { id: "computer_school", includedType: "school", label: "Escola de informática" },
  {
    id: "professional_training",
    includedType: "school",
    label: "Curso profissionalizante",
  },
  { id: "technical_school", includedType: "school", label: "Escola técnica" },
  { id: "college", includedType: "university", label: "Faculdade" },
  { id: "university", includedType: "university", label: "Universidade" },
  { id: "prep_course", includedType: "school", label: "Curso preparatório" },
  { id: "tutoring_service", includedType: "school", label: "Reforço escolar" },
  { id: "private_teacher", includedType: "school", label: "Professor particular" },

  // Tecnologia
  { id: "it_company", includedType: "consultant", label: "Empresa de TI" },
  {
    id: "software_company",
    includedType: "consultant",
    label: "Empresa de software",
  },
  {
    id: "computer_repair",
    includedType: "electronics_store",
    label: "Assistência técnica de computadores",
  },
  {
    id: "phone_repair",
    includedType: "cell_phone_store",
    label: "Assistência técnica de celulares",
  },
  {
    id: "computer_store",
    includedType: "electronics_store",
    label: "Loja de informática",
  },
  {
    id: "electronics_store",
    includedType: "electronics_store",
    label: "Loja de eletrônicos",
  },
  {
    id: "security_systems",
    includedType: "consultant",
    label: "Sistemas de segurança",
  },
  {
    id: "cctv_installer",
    includedType: "electrician",
    label: "Instalação de câmeras",
  },
  {
    id: "alarm_installer",
    includedType: "electrician",
    label: "Instalação de alarmes",
  },
  {
    id: "internet_provider",
    includedType: "telecommunications_service_provider",
    label: "Provedor de internet",
  },
  {
    id: "telecom_company",
    includedType: "telecommunications_service_provider",
    label: "Empresa de telecomunicações",
  },

  // Marketing, comunicação e criativo
  {
    id: "marketing_agency",
    includedType: "marketing_consultant",
    label: "Agência de marketing",
  },
  {
    id: "advertising_agency",
    includedType: "marketing_consultant",
    label: "Agência de publicidade",
  },
  {
    id: "social_media_agency",
    includedType: "marketing_consultant",
    label: "Agência de social media",
  },
  {
    id: "branding_agency",
    includedType: "marketing_consultant",
    label: "Agência de branding",
  },
  {
    id: "graphic_design_studio",
    includedType: "marketing_consultant",
    label: "Estúdio de design gráfico",
  },
  { id: "photographer", includedType: "consultant", label: "Fotógrafo" },
  {
    id: "photography_studio",
    includedType: "consultant",
    label: "Estúdio fotográfico",
  },
  {
    id: "video_production",
    includedType: "consultant",
    label: "Produtora de vídeo",
  },
  { id: "printing_company", includedType: "store", label: "Gráfica" },
  { id: "sign_shop", includedType: "store", label: "Comunicação visual" },
  {
    id: "promotional_products",
    includedType: "store",
    label: "Brindes personalizados",
  },

  // Eventos
  {
    id: "event_planner",
    includedType: "event_venue",
    label: "Organizador de eventos",
  },
  {
    id: "wedding_planner",
    includedType: "wedding_venue",
    label: "Assessoria de casamento",
  },
  {
    id: "party_planner",
    includedType: "event_venue",
    label: "Decoração de festas",
  },
  { id: "event_venue", includedType: "event_venue", label: "Espaço para eventos" },
  {
    id: "wedding_venue",
    includedType: "wedding_venue",
    label: "Espaço para casamentos",
  },
  { id: "party_rental", includedType: "event_venue", label: "Locação para festas" },
  { id: "sound_rental", includedType: "event_venue", label: "Locação de som" },
  {
    id: "lighting_rental",
    includedType: "event_venue",
    label: "Locação de iluminação",
  },
  { id: "dj_service", includedType: "live_music_venue", label: "DJ" },
  { id: "ceremonialist", includedType: "wedding_venue", label: "Cerimonialista" },
  { id: "florist", includedType: "florist", label: "Floricultura" },

  // Moda e varejo
  { id: "clothing_store", includedType: "clothing_store", label: "Loja de roupas" },
  {
    id: "womens_clothing",
    includedType: "womens_clothing_store",
    label: "Moda feminina",
  },
  { id: "mens_clothing", includedType: "clothing_store", label: "Moda masculina" },
  { id: "kids_clothing", includedType: "clothing_store", label: "Moda infantil" },
  {
    id: "fitness_clothing",
    includedType: "sportswear_store",
    label: "Moda fitness",
  },
  { id: "lingerie_store", includedType: "clothing_store", label: "Loja de lingerie" },
  { id: "shoe_store", includedType: "shoe_store", label: "Loja de calçados" },
  { id: "jewelry_store", includedType: "jewelry_store", label: "Joalheria" },
  {
    id: "costume_jewelry",
    includedType: "jewelry_store",
    label: "Loja de semijoias",
  },
  { id: "watch_store", includedType: "jewelry_store", label: "Relojoaria" },
  { id: "bag_store", includedType: "clothing_store", label: "Loja de bolsas" },
  {
    id: "accessories_store",
    includedType: "clothing_store",
    label: "Loja de acessórios",
  },
  { id: "thrift_store", includedType: "thrift_store", label: "Brechó" },
  {
    id: "bridal_store",
    includedType: "clothing_store",
    label: "Loja de vestidos de noiva",
  },
  { id: "uniform_store", includedType: "clothing_store", label: "Loja de uniformes" },

  // Comércio geral
  { id: "supermarket", includedType: "supermarket", label: "Supermercado" },
  { id: "grocery_store", includedType: "grocery_store", label: "Mercado" },
  {
    id: "convenience_store",
    includedType: "convenience_store",
    label: "Loja de conveniência",
  },
  { id: "wholesaler", includedType: "wholesaler", label: "Atacadista" },
  { id: "distributor", includedType: "wholesaler", label: "Distribuidora" },
  { id: "gift_shop", includedType: "gift_shop", label: "Loja de presentes" },
  { id: "toy_store", includedType: "toy_store", label: "Loja de brinquedos" },
  { id: "book_store", includedType: "book_store", label: "Livraria" },
  { id: "stationery_store", includedType: "book_store", label: "Papelaria" },
  {
    id: "party_supply_store",
    includedType: "gift_shop",
    label: "Loja de artigos para festa",
  },
  { id: "baby_store", includedType: "store", label: "Loja de bebê" },
  {
    id: "home_appliance_store",
    includedType: "home_goods_store",
    label: "Loja de eletrodomésticos",
  },

  // Turismo e hospedagem
  { id: "hotel", includedType: "hotel", label: "Hotel" },
  { id: "inn", includedType: "inn", label: "Pousada" },
  { id: "hostel", includedType: "hostel", label: "Hostel" },
  { id: "resort", includedType: "resort_hotel", label: "Resort" },
  {
    id: "vacation_rental",
    includedType: "lodging",
    label: "Aluguel por temporada",
  },
  { id: "travel_agency", includedType: "travel_agency", label: "Agência de viagens" },
  { id: "tour_operator", includedType: "tour_agency", label: "Operadora de turismo" },
  { id: "tour_guide", includedType: "tourist_information_center", label: "Guia turístico" },
  {
    id: "transportation_service",
    includedType: "transportation_service",
    label: "Transporte executivo",
  },
  {
    id: "airport_transfer",
    includedType: "transportation_service",
    label: "Transfer para aeroporto",
  },

  // Serviços residenciais
  {
    id: "cleaning_service",
    includedType: "laundry",
    label: "Empresa de limpeza",
  },
  {
    id: "residential_cleaning",
    includedType: "laundry",
    label: "Limpeza residencial",
  },
  {
    id: "commercial_cleaning",
    includedType: "laundry",
    label: "Limpeza empresarial",
  },
  { id: "pest_control", includedType: "consultant", label: "Dedetizadora" },
  {
    id: "water_tank_cleaning",
    includedType: "plumber",
    label: "Limpeza de caixa d'água",
  },
  { id: "septic_service", includedType: "plumber", label: "Limpeza de fossa" },
  { id: "drain_cleaning", includedType: "plumber", label: "Desentupidora" },
  {
    id: "sofa_cleaning",
    includedType: "laundry",
    label: "Higienização de sofás",
  },
  { id: "carpet_cleaning", includedType: "laundry", label: "Limpeza de tapetes" },
  {
    id: "mattress_cleaning",
    includedType: "laundry",
    label: "Higienização de colchões",
  },
  { id: "laundry", includedType: "laundry", label: "Lavanderia" },
  { id: "dry_cleaning", includedType: "laundry", label: "Lavagem a seco" },
  {
    id: "moving_company",
    includedType: "moving_company",
    label: "Empresa de mudanças",
  },
  { id: "storage", includedType: "storage", label: "Self storage e depósitos" },
  { id: "handyman", includedType: "locksmith", label: "Marido de aluguel" },

  // Segurança
  {
    id: "security_company",
    includedType: "consultant",
    label: "Empresa de segurança",
  },
  {
    id: "private_security",
    includedType: "consultant",
    label: "Segurança privada",
  },
  {
    id: "security_guard_service",
    includedType: "consultant",
    label: "Empresa de vigilância",
  },
  {
    id: "electronic_security",
    includedType: "consultant",
    label: "Segurança eletrônica",
  },
  { id: "access_control", includedType: "consultant", label: "Controle de acesso" },
  { id: "concierge_service", includedType: "consultant", label: "Portaria" },
  {
    id: "remote_concierge",
    includedType: "consultant",
    label: "Portaria remota",
  },
  {
    id: "fire_safety",
    includedType: "consultant",
    label: "Segurança contra incêndio",
  },

  // Logística e transporte
  {
    id: "logistics_company",
    includedType: "shipping_service",
    label: "Empresa de logística",
  },
  {
    id: "transport_company",
    includedType: "shipping_service",
    label: "Transportadora",
  },
  {
    id: "freight_company",
    includedType: "shipping_service",
    label: "Transportadora de cargas",
  },
  {
    id: "courier_service",
    includedType: "courier_service",
    label: "Motoboy e entregas",
  },
  {
    id: "delivery_service",
    includedType: "courier_service",
    label: "Empresa de entregas",
  },
  {
    id: "moving_service",
    includedType: "moving_company",
    label: "Fretes e mudanças",
  },
  { id: "warehouse", includedType: "storage", label: "Armazém logístico" },
  {
    id: "customs_broker",
    includedType: "consultant",
    label: "Despachante aduaneiro",
  },
  {
    id: "vehicle_dispatcher",
    includedType: "consultant",
    label: "Despachante veicular",
  },

  // Indústria e B2B
  { id: "manufacturer", includedType: "manufacturer", label: "Indústria" },
  {
    id: "metal_industry",
    includedType: "manufacturer",
    label: "Indústria metalúrgica",
  },
  {
    id: "plastic_industry",
    includedType: "manufacturer",
    label: "Indústria de plásticos",
  },
  {
    id: "food_industry",
    includedType: "manufacturer",
    label: "Indústria alimentícia",
  },
  {
    id: "textile_industry",
    includedType: "manufacturer",
    label: "Indústria têxtil",
  },
  {
    id: "chemical_industry",
    includedType: "manufacturer",
    label: "Indústria química",
  },
  {
    id: "packaging_company",
    includedType: "manufacturer",
    label: "Empresa de embalagens",
  },
  {
    id: "machinery_company",
    includedType: "manufacturer",
    label: "Máquinas e equipamentos",
  },
  {
    id: "industrial_maintenance",
    includedType: "manufacturer",
    label: "Manutenção industrial",
  },
  {
    id: "industrial_automation",
    includedType: "manufacturer",
    label: "Automação industrial",
  },
  {
    id: "industrial_supplies",
    includedType: "supplier",
    label: "Suprimentos industriais",
  },
  {
    id: "uniform_manufacturer",
    includedType: "manufacturer",
    label: "Fábrica de uniformes",
  },
  {
    id: "furniture_manufacturer",
    includedType: "manufacturer",
    label: "Fábrica de móveis",
  },

  // Agricultura e rural
  {
    id: "agricultural_company",
    includedType: "farm",
    label: "Empresa agrícola",
  },
  {
    id: "agricultural_store",
    includedType: "garden_center",
    label: "Loja agropecuária",
  },
  { id: "farm", includedType: "farm", label: "Fazenda" },
  { id: "cattle_farm", includedType: "ranch", label: "Pecuária" },
  { id: "agronomist", includedType: "consultant", label: "Engenheiro agrônomo" },
  {
    id: "agricultural_consulting",
    includedType: "consultant",
    label: "Consultoria agrícola",
  },
  {
    id: "irrigation_company",
    includedType: "consultant",
    label: "Sistemas de irrigação",
  },
  {
    id: "agricultural_machinery",
    includedType: "manufacturer",
    label: "Máquinas agrícolas",
  },
  { id: "animal_feed_store", includedType: "pet_store", label: "Loja de rações" },

  // Serviços profissionais
  {
    id: "translation_service",
    includedType: "consultant",
    label: "Empresa de tradução",
  },
  { id: "translator", includedType: "consultant", label: "Tradutor" },
  {
    id: "immigration_consulting",
    includedType: "consultant",
    label: "Assessoria de imigração",
  },
  {
    id: "document_service",
    includedType: "consultant",
    label: "Assessoria documental",
  },
  {
    id: "occupational_safety",
    includedType: "consultant",
    label: "Segurança do trabalho",
  },
  {
    id: "occupational_health",
    includedType: "medical_clinic",
    label: "Saúde ocupacional",
  },
  {
    id: "environmental_consulting",
    includedType: "consultant",
    label: "Consultoria ambiental",
  },
  {
    id: "quality_consulting",
    includedType: "consultant",
    label: "Consultoria de qualidade",
  },
  { id: "lgpd_consulting", includedType: "consultant", label: "Consultoria LGPD" },
  {
    id: "training_company",
    includedType: "school",
    label: "Empresa de treinamentos",
  },

  // Serviços pessoais
  { id: "seamstress", includedType: "tailor", label: "Costureira" },
  { id: "tailor", includedType: "tailor", label: "Alfaiate" },
  { id: "shoe_repair", includedType: "shoe_store", label: "Sapataria" },
  { id: "watch_repair", includedType: "jewelry_store", label: "Conserto de relógios" },
  { id: "key_cutting", includedType: "locksmith", label: "Cópia de chaves" },
  {
    id: "electronics_repair",
    includedType: "electronics_store",
    label: "Assistência técnica de eletrônicos",
  },

  // Infantil
  { id: "kids_party_venue", includedType: "banquet_hall", label: "Buffet infantil" },
  { id: "toy_library", includedType: "indoor_playground", label: "Brinquedoteca" },
  {
    id: "kids_recreation",
    includedType: "indoor_playground",
    label: "Recreação infantil",
  },
  {
    id: "baby_swimming",
    includedType: "swimming_pool",
    label: "Natação para bebês",
  },
  {
    id: "child_development_clinic",
    includedType: "medical_clinic",
    label: "Clínica de desenvolvimento infantil",
  },

  // Entretenimento
  { id: "escape_room", includedType: "amusement_center", label: "Escape room" },
  { id: "bowling_alley", includedType: "bowling_alley", label: "Boliche" },
  { id: "paintball", includedType: "paintball_center", label: "Paintball" },
  { id: "airsoft", includedType: "paintball_center", label: "Airsoft" },
  { id: "game_store", includedType: "store", label: "Loja de games" },
  { id: "gaming_center", includedType: "video_arcade", label: "Arena gamer" },
  { id: "karaoke", includedType: "karaoke", label: "Karaokê" },

  // Cultura
  { id: "art_gallery", includedType: "art_gallery", label: "Galeria de arte" },
  { id: "art_school", includedType: "school", label: "Escola de arte" },
  { id: "theater_school", includedType: "school", label: "Escola de teatro" },
  { id: "music_studio", includedType: "art_studio", label: "Estúdio musical" },
  {
    id: "recording_studio",
    includedType: "art_studio",
    label: "Estúdio de gravação",
  },

  // Religioso e terceiro setor
  { id: "church", includedType: "church", label: "Igreja" },
  {
    id: "religious_organization",
    includedType: "church",
    label: "Organização religiosa",
  },
  { id: "ngo", includedType: "non_profit_organization", label: "ONG" },
  {
    id: "association",
    includedType: "association_or_organization",
    label: "Associação",
  },
  {
    id: "institute",
    includedType: "association_or_organization",
    label: "Instituto",
  },
  { id: "foundation", includedType: "non_profit_organization", label: "Fundação" },

  // Funerário
  { id: "funeral_home", includedType: "funeral_home", label: "Funerária" },
  { id: "crematorium", includedType: "funeral_home", label: "Crematório" },
  { id: "cemetery", includedType: "cemetery", label: "Cemitério" },
  { id: "funeral_plan", includedType: "funeral_home", label: "Plano funerário" },
] as const satisfies ReadonlyArray<{
  id: string
  includedType: PlaceTableAType
  label: string
}>

export type ProspectSegment = (typeof PROSPECT_SEGMENTS)[number]
export type ProspectSegmentId = ProspectSegment["id"]

const SEGMENT_IDS = new Set<string>(
  PROSPECT_SEGMENTS.map((segment) => segment.id)
)

export function isProspectSegmentType(
  value: string
): value is ProspectSegmentId {
  return SEGMENT_IDS.has(value)
}

export function getProspectSegment(id: string): ProspectSegment | undefined {
  return PROSPECT_SEGMENTS.find((segment) => segment.id === id)
}

export function getProspectSegmentLabel(value: string) {
  const byId = PROSPECT_SEGMENTS.find((segment) => segment.id === value)
  if (byId) {
    return byId.label
  }
  const byIncludedType = PROSPECT_SEGMENTS.find(
    (segment) => segment.includedType === value
  )
  return byIncludedType?.label ?? value
}
