
export interface KnowledgeBaseArticle {
  id: string;
  keywords: string[];
  content: string;
}

/**
 * The curated knowledge base for the RAG system.
 * This array contains trusted, structured information that the AI will use to
 * formulate its answers in "Precautions" mode.
 */
export const knowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: 'diabetes-01',
    keywords: ['diabetes', 'diabetic', 'blood sugar'],
    content: `
      Disease Name: Diabetes Mellitus
      Overview: A chronic condition affecting how your body regulates blood sugar. Management involves lifestyle choices to maintain stable glucose levels and prevent complications.
      Hygiene Practices:
      - Perform daily foot checks for any cuts, sores, or changes in sensation, and keep feet clean and dry.
      - Maintain good oral hygiene by brushing and flossing daily to prevent gum disease, which is more common in people with diabetes.
      Dietary Recommendations:
      - Focus on complex carbs (whole grains, vegetables, legumes) which are digested slowly.
      - Increase fiber intake to help control blood sugar.
      - Choose lean proteins like fish, chicken, beans, and lentils.
      - Limit intake of sugary drinks, sweets, and highly processed foods.
      Lifestyle Adjustments:
      - Aim for at least 150 minutes of moderate-intensity exercise per week (e.g., brisk walking, swimming).
      - Maintain a healthy weight; losing even 5-7% of body weight can significantly improve blood sugar control.
      - Manage stress effectively through relaxation techniques like meditation or yoga.
      - Get 7-9 hours of quality sleep per night, as poor sleep can affect insulin resistance.
      - Quit smoking, as it increases the risk of diabetes complications.
      Medical Check-ups:
      - Monitor blood sugar levels regularly as advised by your doctor.
      - Schedule annual dilated eye exams to screen for diabetic retinopathy.
      - Get an A1C blood test 2-4 times a year to measure average blood sugar control.
      - Have kidney function tested regularly through urine and blood tests.
    `,
  },
  {
    id: 'hypertension-01',
    keywords: ['hypertension', 'high blood pressure', 'bp'],
    content: `
      Disease Name: Hypertension (High Blood Pressure)
      Overview: A common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.
      Hygiene Practices:
      - Not directly applicable, but maintaining overall health is key.
      Dietary Recommendations:
      - Reduce sodium (salt) intake significantly. Avoid processed foods, which are often high in sodium.
      - Follow the DASH (Dietary Approaches to Stop Hypertension) diet, which is rich in fruits, vegetables, whole grains, and low-fat dairy.
      - Increase potassium intake from sources like bananas, potatoes, and spinach, as it can lessen the effects of sodium.
      - Limit alcohol consumption.
      Lifestyle Adjustments:
      - Engage in regular physical activity, aiming for at least 150 minutes of moderate-intensity exercise per week.
      - Maintain a healthy weight. Losing excess weight is one of the most effective ways to lower blood pressure.
      - Quit smoking. Nicotine raises your blood pressure and heart rate.
      - Manage stress through techniques like deep breathing, meditation, or physical activity.
      - Limit caffeine intake.
      Medical Check-ups:
      - Monitor your blood pressure regularly at home and have it checked by a healthcare provider.
      - Adhere to any prescribed medication schedules without fail.
      - Have regular check-ups to monitor for related complications like heart and kidney disease.
    `,
  },
  {
    id: 'common-cold-01',
    keywords: ['common cold', 'cold', 'rhinovirus', 'flu', 'sore throat', 'runny nose'],
    content: `
      Disease Name: Common Cold
      Overview: A mild viral infection of the nose and throat. It is typically harmless, with symptoms resolving in about a week. Prevention is focused on hygiene and immune support.
      Hygiene Practices:
      - Wash hands frequently with soap and water for at least 20 seconds. This is the single most effective way to prevent transmission.
      - Use an alcohol-based hand sanitizer (at least 60% alcohol) when soap and water are not available.
      - Avoid touching your eyes, nose, and mouth with unwashed hands.
      - Clean and disinfect frequently touched surfaces like doorknobs, light switches, and phones, especially when someone is sick.
      - Sneeze or cough into a tissue or your elbow, not your hands.
      Dietary Recommendations:
      - Stay well-hydrated by drinking plenty of water, juice, or clear broth.
      - Eat a balanced diet rich in vitamins and minerals, especially Vitamin C, to support immune function.
      - Consider warm liquids like chicken soup, which can be soothing and help loosen congestion.
      Lifestyle Adjustments:
      - Get adequate rest and sleep to allow your immune system to function optimally.
      - Avoid close, prolonged contact with people who have colds.
      - Don't share drinking glasses or utensils with family members.
      - Manage stress, as chronic stress can weaken the immune system.
      Medical Check-ups:
      - The common cold usually does not require medical attention.
      - Consult a doctor if symptoms are severe, last more than 10 days, or are accompanied by a high fever (above 101.3°F or 38.5°C), as it could indicate a more serious infection like the flu or a bacterial infection.
    `,
  },
];
