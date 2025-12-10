"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const circuitsData = [
  {
    id: "nord-au-sud-12j",
    name: "Circuit Nord au Sud - 12 Jours",
    section: "circuits",
    description: "Un voyage complet du nord au sud du Maroc, découvrant Marrakech, le désert, les villes impériales et la côte atlantique sur 12 jours.",
    duration: "12 jours / 11 nuits",
    priceMAD: 0,
    location: "Marrakech - Fès - Casablanca",
    groupSize: "2-45 personnes",
    rating: 0,
    availableDays: ["everyday"],
    timeSlots: [{ startTime: "08:00", endTime: "19:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Visite de Marrakech (Koutoubia, Place Jemaa El-Fna, souks)",
      "Jour 3: Marrakech - Zagora via Ouarzazate et col de Tizin-Tichka",
      "Jour 4: Zagora - Erfoud (option dunes de Merzouga en 4x4)",
      "Jour 5: Erfoud - Tinghir via vallée des roses et gorges de Todgha",
      "Jour 6: Tinghir - Marrakech via route des Mille Kasbahs et Ait Benhaddou",
      "Jour 7: Marrakech - Fès via Ifrane \"Suisse du Maroc\"",
      "Jour 8: Visite de Fès (médina UNESCO, Karaouiyne, Médersa Bou Anania)",
      "Jour 9: Fès - Casablanca via Volubilis, Meknès et Rabat",
      "Jour 10: Casablanca - Marrakech (visite mosquée Hassan II)",
      "Jour 11: Journée libre à Marrakech",
      "Jour 12: Transfert aéroport"
    ],
    included: [
      "Transferts aéroport/hôtel/aéroport en minibus ou bus",
      "11 nuits en hôtel 4* NL (Normes Locales)",
      "Pension complète (dîner J1 au petit-déjeuner J12)",
      "Guide francophone",
      "Visites et entrées aux monuments",
      "Assistance sur place"
    ],
    notIncluded: [
      "Dépenses personnelles",
      "Taxes de séjour (environ 2€/nuit/personne)",
      "Déjeuner journée libre",
      "Boissons"
    ],
    images: [
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70",
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00"
    ],
    items: []
  },
  {
    id: "perles-du-nord-8j",
    name: "Circuit Perles du Nord - 8 Jours",
    section: "circuits",
    description: "Découvrez le nord du Maroc avec Tanger, Tétouan, Chefchaouen la ville bleue, Fès, Volubilis, Meknès, Rabat et Larache.",
    duration: "8 jours / 7 nuits",
    priceMAD: 0,
    location: "Tanger - Fès - Rabat",
    groupSize: "4-54 personnes",
    rating: 0,
    availableDays: ["everyday"],
    timeSlots: [{ startTime: "08:00", endTime: "18:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Tanger",
      "Jour 2: Visite de Tanger (médina, cap Spartel, Kasbah)",
      "Jour 3: Tanger - Tétouan - Chefchaouen - Fès (364 km)",
      "Jour 4: Visite complète de Fès (médina UNESCO, souks, tanneries)",
      "Jour 5: Fès - Volubilis - Meknès - Rabat (220 km)",
      "Jour 6: Rabat - Larache - Tanger (255 km)",
      "Jour 7: Journée libre à Tanger",
      "Jour 8: Transfert aéroport"
    ],
    included: [
      "Transferts aller/retour aéroport",
      "7 nuits en hôtel 4* NL selon programme",
      "Pension complète (dîner J1 au petit-déjeuner J8)",
      "Guide francophone",
      "Visites mentionnées au programme"
    ],
    notIncluded: [
      "Frais de service",
      "Boissons",
      "Pourboires guides et chauffeurs (environ 3€/jour/personne)",
      "Excursions facultatives",
      "Taxes de séjour (environ 2€/personne/nuit)",
      "Déjeuner journée libre"
    ],
    images: [
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24",
      "https://images.unsplash.com/photo-1575551347328-c6253746c063"
    ],
    items: []
  },
  {
    id: "villes-imperiales-chefchaouen-8j",
    name: "Circuit Villes Impériales avec Chefchaouen - 8 Jours",
    section: "circuits",
    description: "Circuit complet des villes impériales du Maroc incluant Marrakech, Fès, Meknès, Rabat, Casablanca et la perle bleue Chefchaouen.",
    duration: "8 jours / 7 nuits",
    priceMAD: 0,
    location: "Marrakech - Casablanca - Fès",
    groupSize: "2-45 personnes",
    rating: 0,
    availableDays: ["everyday"],
    timeSlots: [{ startTime: "08:00", endTime: "19:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Marrakech - Casablanca - Rabat - Larache Lixus (490 km)",
      "Jour 3: Larache - Chefchaouen - Fès (330 km)",
      "Jour 4: Visite complète de Fès",
      "Jour 5: Fès - Volubilis - Meknès - Fès (200 km)",
      "Jour 6: Fès - Ifrane - Marrakech (480 km)",
      "Jour 7: Visite complète de Marrakech",
      "Jour 8: Transfert aéroport"
    ],
    included: [
      "Hébergement 7 nuits hôtel 4* NL",
      "Pension complète",
      "Guide francophone",
      "Visites et entrées",
      "Transferts"
    ],
    notIncluded: [
      "Boissons",
      "Pourboires",
      "Dépenses personnelles",
      "Taxes de séjour"
    ],
    images: [
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b",
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00"
    ],
    items: []
  },
  {
    id: "villes-imperiales-8j",
    name: "Circuit Villes Impériales - 8 Jours",
    section: "circuits",
    description: "Découverte des quatre villes impériales du Maroc: Marrakech, Fès, Meknès et Rabat, avec visite de Casablanca et Volubilis.",
    duration: "8 jours / 7 nuits",
    priceMAD: 0,
    location: "Marrakech - Fès - Casablanca",
    groupSize: "2-45 personnes",
    rating: 0,
    availableDays: ["thursday", "monday", "friday", "tuesday", "saturday", "wednesday"],
    timeSlots: [{ startTime: "08:00", endTime: "18:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Marrakech - Beni Mellal - Fès (485 km) via Moyen Atlas",
      "Jour 3: Visite complète de Fès (médina UNESCO)",
      "Jour 4: Fès - Volubilis - Meknès - Casablanca (visite Rabat en route)",
      "Jour 5: Casablanca - Marrakech (visite mosquée Hassan II)",
      "Jour 6: Visite complète de Marrakech (Koutoubia, Bahia, souks)",
      "Jour 7: Journée libre à Marrakech",
      "Jour 8: Transfert aéroport"
    ],
    included: [
      "Transferts aller/retour aéroport",
      "7 nuits hôtel 4* NL",
      "Pension complète",
      "Guide francophone",
      "Visites mentionnées"
    ],
    notIncluded: [
      "Boissons",
      "Pourboires",
      "Excursions facultatives",
      "Taxes de séjour"
    ],
    images: [
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b",
      "https://images.unsplash.com/photo-1568321414770-32a2139655e0"
    ],
    items: []
  },
  {
    id: "grand-tour-maroc-13j",
    name: "Grand Tour du Maroc - 13 Jours",
    section: "circuits",
    description: "Le circuit le plus complet! Du nord au sud, découvrez Marrakech, le désert, Fès, Tanger, Rabat, Casablanca, Essaouira et Agadir en 13 jours.",
    duration: "13 jours / 12 nuits",
    priceMAD: 0,
    location: "Marrakech - Désert - Fès - Tanger - Agadir",
    groupSize: "2-45 personnes",
    rating: 0,
    availableDays: ["everyday"],
    timeSlots: [{ startTime: "07:00", endTime: "19:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Visite de Marrakech",
      "Jour 3: Marrakech - Ait Ben Haddou - Tinghir (370 km)",
      "Jour 4: Tinghir - Gorges de Todra - Erfoud (219 km, option dunes 4x4)",
      "Jour 5: Erfoud - Midelt - Fès (397 km)",
      "Jour 6: Visite complète de Fès",
      "Jour 7: Fès - Chefchaouen - Tanger (300 km)",
      "Jour 8: Tanger - Rabat - Casablanca (320 km autoroute)",
      "Jour 9: Casablanca - El Jadida - Oualidia - Essaouira (385 km)",
      "Jour 10: Essaouira - Agadir (170 km)",
      "Jour 11: Agadir - Marrakech (220 km autoroute)",
      "Jour 12: Journée libre à Marrakech",
      "Jour 13: Transfert aéroport"
    ],
    included: [
      "Transferts en véhicule climatisé",
      "12 nuits hôtel 3*/4* NL",
      "Pension complète (dîner J1 au petit-déjeuner J13)",
      "Guide national francophone",
      "Guides locaux principales villes",
      "Visites et entrées monuments",
      "Assistance complète sur place"
    ],
    notIncluded: [
      "Boissons",
      "Port des bagages",
      "Pourboires",
      "Extras et dépenses personnelles",
      "Supplément chambre single",
      "Taxes de séjour (environ 2€/personne/nuit)",
      "Déjeuner journée libre"
    ],
    images: [
      "https://images.unsplash.com/photo-1508433957232-3107f5fd5995",
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00"
    ],
    items: []
  },
  {
    id: "sud-maroc-4x4-8j",
    name: "Circuit Le Sud du Maroc en 4x4 - 8 Jours",
    section: "circuits",
    description: "Aventure tout-terrain dans le sud marocain! Découvrez Ait Ben Haddou, les gorges de Todra, bivouac dans le désert de Merzouga, et traversée de l'Anti-Atlas en 4x4.",
    duration: "8 jours / 7 nuits",
    priceMAD: 0,
    location: "Marrakech - Désert Merzouga - Agadir",
    groupSize: "2-20 personnes",
    rating: 0,
    availableDays: ["everyday"],
    timeSlots: [{ startTime: "07:00", endTime: "19:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Marrakech - Ait Ben Haddou - Ouarzazate - Tinghir (départ 7h en 4x4)",
      "Jour 3: Tinghir - Gorges de Todra - Erfoud - Merzouga (bivouac sous tentes)",
      "Jour 4: Merzouga - Zagora (piste de Dakar)",
      "Jour 5: Zagora - Taznakht - Taroudante - Agadir (Anti-Atlas)",
      "Jour 6: Agadir - Essaouira - Marrakech (côte atlantique)",
      "Jour 7: Visite complète de Marrakech",
      "Jour 8: Transfert aéroport"
    ],
    included: [
      "Transferts aller/retour aéroport",
      "Chauffeur/guide francophone spécialiste 4x4",
      "7 nuits hébergement (hôtels 4* NL + bivouac)",
      "Pension complète (dîner J1 au petit-déjeuner J8)",
      "Visites mentionnées au programme"
    ],
    notIncluded: [
      "Frais de service",
      "Boissons",
      "Pourboires (environ 3€/jour/personne)",
      "Dépenses personnelles",
      "Excursions facultatives",
      "Taxes de séjour (environ 2€/personne/nuit)"
    ],
    images: [
      "https://images.unsplash.com/photo-1542359407-79a4da9b794f",
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24"
    ],
    items: []
  },
  {
    id: "grand-sud-maroc-8j",
    name: "Tour du Grand Sud du Maroc - 8 Jours",
    section: "circuits",
    description: "Circuit économique dans le grand sud marocain: Ouarzazate, vallée du Draa, Zagora, Erfoud, gorges de Todgha, route des Mille Kasbahs et Ait Benhaddou.",
    duration: "8 jours / 7 nuits",
    priceMAD: 0,
    location: "Marrakech - Zagora - Erfoud - Tinghir",
    groupSize: "2-47 personnes",
    rating: 0,
    availableDays: ["thursday", "friday", "saturday"],
    timeSlots: [{ startTime: "08:00", endTime: "18:00" }],
    ageGroups: true,
    highlights: [
      "Jour 1: Arrivée à Marrakech",
      "Jour 2: Marrakech - Ouarzazate - Zagora (370 km)",
      "Jour 3: Zagora - Erfoud (280 km, plaine caillouteuse)",
      "Jour 4: Erfoud - Todgha - Tinghir (200 km, gorges)",
      "Jour 5: Tinghir - Marrakech (363 km, route des Mille Kasbahs, Ait Benhaddou)",
      "Jour 6: Visite complète de Marrakech (Koutoubia, médina, souks)",
      "Jour 7: Journée libre à Marrakech",
      "Jour 8: Transfert aéroport"
    ],
    included: [
      "Guide/accompagnateur (ou chauffeur-guide pour 2-4 personnes)",
      "7 nuits hôtel 4* NL",
      "Pension complète hors boissons (dîner J1 au petit-déjeuner J8)",
      "Visites sites et monuments selon itinéraire"
    ],
    notIncluded: [
      "Frais de service",
      "Boissons",
      "Pourboires guides et chauffeurs (environ 3€/jour/personne)",
      "Excursions facultatives",
      "Taxes de séjour"
    ],
    images: [
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00",
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70"
    ],
    items: []
  }
];

export default function PopulateCircuitsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handlePopulate = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/admin/excursions/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ excursions: circuitsData }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        toast.success(`Successfully created ${data.created} circuits!`);
      } else {
        toast.error(data.error || "Failed to populate circuits");
        setResults(data);
      }
    } catch (error: any) {
      console.error("Error populating circuits:", error);
      toast.error("Failed to populate circuits: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Populate Circuits Database</CardTitle>
          <CardDescription>
            Click the button below to populate the database with 7 pre-configured circuits.
            All circuits are set with contact-based pricing (0 MAD = "Contact for pricing").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Circuits to be created:</h3>
            <ul className="space-y-2 text-sm">
              {circuitsData.map((circuit, index) => (
                <li key={circuit.id} className="flex items-start gap-2">
                  <span className="font-medium text-primary">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{circuit.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {circuit.duration} • Contact for pricing • {circuit.location}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handlePopulate}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Populating Database...
              </>
            ) : (
              "Populate Database with Circuits"
            )}
          </Button>

          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{results.created || 0}</p>
                      <p className="text-xs text-muted-foreground">Created</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{results.skipped || 0}</p>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{results.failed || 0}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </div>

                {results.results && results.results.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-sm">Details:</h4>
                    {results.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm ${result.action === "created"
                            ? "bg-green-50 border border-green-200"
                            : result.action === "skipped"
                              ? "bg-yellow-50 border border-yellow-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                      >
                        <p className="font-medium">{result.id}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {result.action}
                          {result.error && `: ${result.error}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}