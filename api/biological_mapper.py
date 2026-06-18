# biological_mapper.py

def evaluate_biomarker(name, value, optimal_min, optimal_max):
    if value < optimal_min:
        return {"status": "Deficient", "color": "red", "value": value, "delta": optimal_min - value}
    elif value > optimal_max:
        return {"status": "Excessive", "color": "orange", "value": value, "delta": value - optimal_max}
    else:
        return {"status": "Optimal", "color": "green", "value": value, "delta": 0}

def generate_clinical_report(patient_data: dict, dysbiosis_risk: float) -> dict:
    
    biomarkers = {
        "Butyrate": evaluate_biomarker("Butyrate", patient_data.get('Butyrate', 0), 0.15, 0.40),
        "Acetate": evaluate_biomarker("Acetate", patient_data.get('Acetate', 0), 0.20, 0.50),
        "Faecalibacterium": evaluate_biomarker("Faecalibacterium", patient_data.get('Faecalibacterium', 0), 0.02, 0.15),
        "Akkermansia": evaluate_biomarker("Akkermansia", patient_data.get('Akkermansia', 0), 0.01, 0.08),
        "Bilophila": evaluate_biomarker("Bilophila", patient_data.get('Bilophila', 0), 0.00, 0.02),
        "Inflammation": evaluate_biomarker("Inflammatory_Markers", patient_data.get('Host_Responses_Inflammatory_Markers', 0), 0.00, 0.05)
    }

    report = {
        "consultation_summary": "",
        "vitals_management": [],
        "dietary_prescription": {"foods_to_add": [], "foods_to_reduce": [], "clinical_rationale": []},
        "biomarker_status": biomarkers
    }

    deficient_list = [k for k, v in biomarkers.items() if v["status"] == "Deficient"]
    excessive_list = [k for k, v in biomarkers.items() if v["status"] == "Excessive"]
    
    # Extract Patient Metadata for Contextual Branching
    diet_type = patient_data.get('Diet_Type', 1)  # 1 = Plant, 0 = Animal
    disease_val = str(patient_data.get('Disease_Name', patient_data.get('Disease', 'Unknown')))

    # --- DYNAMIC SUMMARY ---
    summary_sentences = []
    if disease_val not in ['0', '0.0', 'No disease', 'Healthy', 'Unknown']:
        summary_sentences.append(f"Patient presents with a clinical history of {disease_val}.")
    
    if dysbiosis_risk > 0.50:
        summary_sentences.append(f"AI classification indicates clinical dysbiosis (Risk Factor: {dysbiosis_risk*100:.1f}%).")
    else:
        summary_sentences.append(f"AI classification indicates a biologically stable microbiome (Risk Factor: {dysbiosis_risk*100:.1f}%).")

    if deficient_list:
        summary_sentences.append(f"Metabolomic mapping reveals critical deficiencies in {', '.join(deficient_list)} pathways.")
    if excessive_list:
        summary_sentences.append(f"We detect pathogenic overgrowth primarily driven by {', '.join(excessive_list)}.")
    
    report["consultation_summary"] = " ".join(summary_sentences)

    # --- DYNAMIC RATIONALE & DIET PRESCRIPTION (Based on Severity & Current Diet) ---
    
    # 1. BUTYRATE / BARRIER LOGIC
    if "Butyrate" in deficient_list or "Faecalibacterium" in deficient_list:
        delta = biomarkers['Butyrate']['delta']
        report["dietary_prescription"]["clinical_rationale"].append(
            f"Patient Butyrate levels are currently at {biomarkers['Butyrate']['value']:.4f}. Because this is {delta:.4f} below the clinical minimum, barrier integrity is compromised."
        )
        report["vitals_management"].append(f"Increase Butyrate concentration by +{delta:.4f} units to repair epithelial lining.")
        
        # Dietary Branching based on severity
        if delta > 0.15: # Severe Deficiency
            report["dietary_prescription"]["foods_to_add"].extend(["Clinical-grade resistant starch supplements", "High-inulin root vegetables (Jerusalem artichoke, raw chicory)"])
        else: # Mild Deficiency
            if diet_type == 1: # Already eats plants, needs specific ones
                report["dietary_prescription"]["foods_to_add"].extend(["Cooled complex carbs (overnight oats, cooled potatoes)", "Increase legume diversity (lentils, chickpeas)"])
            else: # Meat eater, needs foundational fiber
                report["dietary_prescription"]["foods_to_add"].extend(["Transition to plant-based complex carbohydrates", "Cruciferous vegetables (broccoli, brussels sprouts)"])

    # 2. AKKERMANSIA / MUCIN LOGIC
    if "Akkermansia" in deficient_list:
        delta = biomarkers['Akkermansia']['delta']
        report["dietary_prescription"]["clinical_rationale"].append(f"Akkermansia is severely depleted ({biomarkers['Akkermansia']['value']:.4f}). This correlates directly with a degradation of the intestinal mucin layer.")
        report["vitals_management"].append(f"Stimulate Akkermansia growth by a minimum of +{delta:.4f} relative abundance.")
        
        if delta > 0.04: # Severe
            report["dietary_prescription"]["foods_to_add"].extend(["High-dose polyphenol extracts (pomegranate extract, green tea)", "Dietary Omega-3s (wild-caught salmon, flaxseed)"])
        else:
            report["dietary_prescription"]["foods_to_add"].extend(["Daily servings of dark berries (blackberries, blueberries)", "Extra virgin olive oil"])

    # 3. BILOPHILA / INFLAMMATION LOGIC
    if "Bilophila" in excessive_list or "Inflammation" in excessive_list:
        delta = biomarkers['Inflammation']['delta']
        report["dietary_prescription"]["clinical_rationale"].append(f"Inflammatory markers are elevated (exceeding baseline by {delta:.4f}). This is likely driven by bile-tolerant pathogen overgrowth.")
        report["vitals_management"].append(f"Reduce systemic inflammation markers by -{delta:.4f} through pathogen starvation.")
        
        if diet_type == 0: # If Animal-Dominant Diet
            report["dietary_prescription"]["foods_to_reduce"].extend(["Strictly limit high-fat dairy and saturated animal fats", "Eliminate ultra-processed meats (bacon, sausages)"])
        else: # If Plant-Dominant Diet (inflammation coming from elsewhere)
            report["dietary_prescription"]["foods_to_reduce"].extend(["Eliminate artificial emulsifiers and highly refined seed oils", "Reduce simple sugar intake"])

    # Fallbacks for perfectly healthy patients
    if not report["dietary_prescription"]["foods_to_add"]:
        report["dietary_prescription"]["foods_to_add"].append("Maintain current diverse, nutrient-dense dietary intake.")
    if not report["dietary_prescription"]["clinical_rationale"]:
        report["dietary_prescription"]["clinical_rationale"].append(f"All tracked target biomarkers are within optimal functional ranges for this patient profile.")

    # Remove duplicates
    report["dietary_prescription"]["foods_to_add"] = list(set(report["dietary_prescription"]["foods_to_add"]))
    report["dietary_prescription"]["foods_to_reduce"] = list(set(report["dietary_prescription"]["foods_to_reduce"]))
    
    return report