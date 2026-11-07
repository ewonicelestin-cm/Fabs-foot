import React from "react";
import {
  Home,
  Radio,
  Calendar,
  Trophy,
  Target,
  Cpu,
  BarChart2,
  ListOrdered,
  Search,
  History,
  UserCheck,
  Scale
} from "lucide-react";

export type RubricId =
  | "accueil"
  | "live"
  | "calendrier"
  | "competitions"
  | "pronostics"
  | "analyse-ia"
  | "statistiques"
  | "classements"
  | "recherche"
  | "historique"
  | "espace-personnel"
  | "comparateur";

interface NavigationProps {
  activeRubric: RubricId;
  onSelectRubric: (rubric: RubricId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeRubric,
  onSelectRubric,
}) => {
  const rubrics: { id: RubricId; label: string; icon: React.ReactNode }[] = [
    { id: "accueil", label: "Accueil", icon: <Home size={16} /> },
    { id: "live", label: "Matchs en direct", icon: <Radio size={16} /> },
    { id: "calendrier", label: "Calendrier", icon: <Calendar size={16} /> },
    { id: "competitions", label: "Compétitions", icon: <Trophy size={16} /> },
    { id: "pronostics", label: "Pronostics", icon: <Target size={16} /> },
    { id: "analyse-ia", label: "Pronostic IA exclusif", icon: <Cpu size={16} /> },
    { id: "statistiques", label: "Statistiques", icon: <BarChart2 size={16} /> },
    { id: "classements", label: "Classements", icon: <ListOrdered size={16} /> },
    { id: "recherche", label: "Recherche", icon: <Search size={16} /> },
    { id: "historique", label: "Historique", icon: <History size={16} /> },
    { id: "espace-personnel", label: "Espace Personnel", icon: <UserCheck size={16} /> },
    { id: "comparateur", label: "Comparateur", icon: <Scale size={16} /> },
  ];

  return (
    <nav className="rubric-nav">
      <div className="rubric-nav-container">
        {rubrics.map((r) => (
          <button
            key={r.id}
            className={`rubric-tab ${activeRubric === r.id ? "active" : ""}`}
            onClick={() => onSelectRubric(r.id)}
          >
            {r.icon}
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
