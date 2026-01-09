export const dietData = {
    "Fat Loss": {
        "Veg": [
            {
                day: "Monday",
                meals: [
                    { id: 101, type: "Breakfast", name: "Oats with Berries", calories: 320, protein: 10, carbs: 55, fat: 6, tags: ["High Fiber", "Vegan"], image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&q=80", ingredients: ["50g Oats", "Almond Milk", "Berries"], prepTime: "10 min" },
                    { id: 102, type: "Lunch", name: "Paneer & Quinoa Salad", calories: 380, protein: 20, carbs: 40, fat: 15, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", ingredients: ["100g Paneer", "Quinoa", "Cucumber"], prepTime: "15 min" },
                    { id: 103, type: "Snack", name: "Roasted Chana", calories: 150, protein: 8, carbs: 20, fat: 4, tags: ["Vegan"], image: "https://images.unsplash.com/photo-1599423300746-b62533397364?w=500&q=80", ingredients: ["100g Chana", "Spices"], prepTime: "5 min" },
                    { id: 104, type: "Dinner", name: "Lentil Soup", calories: 300, protein: 18, carbs: 45, fat: 5, tags: ["High Protein", "Comfort"], image: "https://images.unsplash.com/photo-1547592166-23acbe32263b?w=500&q=80", ingredients: ["Yellow Dal", "Spinach", "Garlic"], prepTime: "20 min" }
                ]
            },
            {
                day: "Tuesday",
                meals: [
                    { id: 105, type: "Breakfast", name: "Poha with Sprouts", calories: 350, protein: 12, carbs: 60, fat: 8, images: "https://images.unsplash.com/photo-1595854341625-f33ee10432fa?w=500&q=80", ingredients: ["Flattened Rice", "Moong Sprouts"], prepTime: "15 min" },
                    { id: 106, type: "Lunch", name: "Tofu Stir Fry", calories: 400, protein: 25, carbs: 30, fat: 12, ingredients: ["Tofu", "Broccoli", "Soy Sauce"] }
                ]
            },
            { day: "Wednesday", meals: [{ id: 107, type: "Breakfast", name: "Fruit Smoothie Bowl", calories: 300, protein: 5, carbs: 70, fat: 4, ingredients: ["Banana", "Strawberry", "Granola"] }] },
            { day: "Thursday", meals: [{ id: 108, type: "Lunch", name: "Chickpea Wrap", calories: 450, protein: 15, carbs: 65, fat: 10, ingredients: ["Chickpeas", "Wheat Wrap"] }] },
            { day: "Friday", meals: [{ id: 109, type: "Dinner", name: "Vegetable Dalia", calories: 320, protein: 12, carbs: 55, fat: 6, ingredients: ["Broken Wheat", "Carrots", "Beans"] }] },
            { day: "Saturday", meals: [{ id: 110, type: "Breakfast", name: "Besan Chilla", calories: 350, protein: 15, carbs: 50, fat: 10, ingredients: ["Gram Flour", "Spinach"] }] },
            { day: "Sunday", meals: [{ id: 111, type: "Lunch", name: "Brown Rice & Soyabean", calories: 500, protein: 30, carbs: 80, fat: 12, ingredients: ["Brown Rice", "Soyabean Chunks"] }] }
        ],
        "Non-Veg": [
            {
                day: "Monday",
                meals: [
                    { id: 201, type: "Breakfast", name: "Boiled Eggs & Toast", calories: 350, protein: 20, carbs: 30, fat: 12, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?w=500&q=80", ingredients: ["3 Eggs", "Wheat Toast"], prepTime: "10 min" },
                    { id: 202, type: "Lunch", name: "Grilled Chicken Salad", calories: 450, protein: 40, carbs: 15, fat: 20, tags: ["High Protein", "Low Carb"], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", ingredients: ["Chicken Breast", "Lettuce", "Olive Oil"], prepTime: "20 min" },
                    { id: 203, type: "Snack", name: "Protein Yogurt", calories: 200, protein: 15, carbs: 10, fat: 5, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1488477181946-6428a029177b?w=500&q=80", ingredients: ["Greek Yogurt", "Berries"], prepTime: "2 min" },
                    { id: 204, type: "Dinner", name: "Fish Curry", calories: 400, protein: 30, carbs: 10, fat: 15, tags: ["Keto"], image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?w=500&q=80", ingredients: ["Fish Fillet", "Coconut Milk", "Spices"], prepTime: "25 min" }
                ]
            },
            {
                day: "Tuesday",
                meals: [
                    { id: 205, type: "Breakfast", name: "Chicken Omelette", calories: 400, protein: 35, carbs: 5, fat: 25, ingredients: ["2 Eggs", "50g Chicken"] }
                ]
            },
            { day: "Wednesday", meals: [{ id: 206, type: "Lunch", name: "Turkey Sandwich", calories: 450, protein: 30, carbs: 40, fat: 15, ingredients: ["Turkey Breast", "Whole Grain Bread"] }] },
            { day: "Thursday", meals: [{ id: 207, type: "Dinner", name: "Steamed Salmon", calories: 500, protein: 40, carbs: 0, fat: 35, ingredients: ["Salmon", "Lemon", "Herbs"] }] },
            { day: "Friday", meals: [{ id: 208, type: "Snack", name: "Beef Jerky", calories: 150, protein: 20, carbs: 5, fat: 5 }] },
            { day: "Saturday", meals: [{ id: 209, type: "Breakfast", name: "Egg Mayo Wrap", calories: 500, protein: 25, carbs: 40, fat: 30 }] },
            { day: "Sunday", meals: [{ id: 210, type: "Lunch", name: "Chicken Biryani (Low Fat)", calories: 600, protein: 45, carbs: 80, fat: 15 }] }
        ]
    },
    "Muscle Gain": {
        "Veg": [
            {
                day: "Monday",
                meals: [
                    { id: 301, type: "Breakfast", name: "Paneer Paratha", calories: 500, protein: 18, carbs: 60, fat: 20, tags: ["High Calorie"], image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80", ingredients: ["Wheat Flour", "Paneer", "Ghee"], prepTime: "15 min" },
                    { id: 302, type: "Lunch", name: "Rajma Chawal", calories: 700, protein: 25, carbs: 90, fat: 15, tags: ["High Protein", "Bulking"], image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80", ingredients: ["Kidney Beans", "Basmati Rice", "Spices"], prepTime: "30 min" },
                    { id: 303, type: "Snack", name: "Banana Shake", calories: 400, protein: 10, carbs: 60, fat: 10, tags: ["High Carb"], image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80", ingredients: ["2 Bananas", "Milk", "Peanut Butter"], prepTime: "5 min" },
                    { id: 304, type: "Dinner", name: "Soya Chunk Curry", calories: 500, protein: 40, carbs: 30, fat: 15, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=500&q=80", ingredients: ["Soya Chunks", "Tomato Gravy"], prepTime: "25 min" }
                ]
            },
            { day: "Tuesday", meals: [{ id: 305, type: "Breakfast", name: "Almond Butter Toast", calories: 450, protein: 15, carbs: 40, fat: 30 }] },
            { day: "Wednesday", meals: [{ id: 306, type: "Lunch", name: "Chole Bhature (Whey version)", calories: 800, protein: 30, carbs: 100, fat: 35 }] },
            { day: "Thursday", meals: [{ id: 307, type: "Dinner", name: "Paneer Butter Masala", calories: 700, protein: 35, carbs: 20, fat: 55 }] },
            { day: "Friday", meals: [{ id: 308, type: "Snack", name: "Mixed Nuts", calories: 400, protein: 12, carbs: 10, fat: 35 }] },
            { day: "Saturday", meals: [{ id: 309, type: "Breakfast", name: "Peanut Butter & Jelly", calories: 500, protein: 20, carbs: 60, fat: 25 }] },
            { day: "Sunday", meals: [{ id: 310, type: "Lunch", name: "Veg Thali (High Cal)", calories: 900, protein: 40, carbs: 110, fat: 40 }] }
        ],
        "Non-Veg": [
            {
                day: "Monday",
                meals: [
                    { id: 401, type: "Breakfast", name: "Chicken & Eggs", calories: 600, protein: 50, carbs: 20, fat: 25, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80", ingredients: ["3 Eggs", "100g Chicken"], prepTime: "15 min" },
                    { id: 402, type: "Lunch", name: "Mutton Biryani", calories: 850, protein: 45, carbs: 90, fat: 35, tags: ["Bulking"], image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80", ingredients: ["Mutton", "Basmati Rice", "Spices"], prepTime: "45 min" },
                    { id: 403, type: "Snack", name: "Mass Gainer Shake", calories: 500, protein: 40, carbs: 60, fat: 5, tags: ["Supplement"], image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80", ingredients: ["Whey Protein", "Oats", "Milk"], prepTime: "2 min" },
                    { id: 404, type: "Dinner", name: "Grilled Fish & Potato", calories: 600, protein: 45, carbs: 50, fat: 15, tags: ["High Protein"], image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80", ingredients: ["Fish Fillet", "Potatoes"], prepTime: "30 min" }
                ]
            },
            { day: "Tuesday", meals: [{ id: 405, type: "Lunch", name: "Steak and Eggs", calories: 800, protein: 60, carbs: 5, fat: 60 }] },
            { day: "Wednesday", meals: [{ id: 406, type: "Dinner", name: "Chicken Pasta (Creamy)", calories: 750, protein: 50, carbs: 80, fat: 30 }] },
            { day: "Thursday", meals: [{ id: 407, type: "Breakfast", name: "Ham and Cheese Crossiant", calories: 600, protein: 30, carbs: 45, fat: 35 }] },
            { day: "Friday", meals: [{ id: 408, type: "Snack", name: "Protein Bars", calories: 300, protein: 30, carbs: 25, fat: 10 }] },
            { day: "Saturday", meals: [{ id: 409, type: "Breakfast", name: "Tuna Salad Sandwiches", calories: 600, protein: 45, carbs: 50, fat: 20 }] },
            { day: "Sunday", meals: [{ id: 410, type: "Lunch", name: "Full Roast Chicken", calories: 1000, protein: 80, carbs: 20, fat: 70 }] }
        ]
    },
    "Maintenance": {
        "Veg": [
            { day: "Monday", meals: [{ id: 501, type: "Breakfast", name: "Poha", calories: 300, protein: 5, carbs: 50, fat: 8, tags: ["Light"], image: "https://images.unsplash.com/photo-1595854341625-f33ee10432fa?w=500&q=80", ingredients: ["Flattened Rice", "Peanuts"], prepTime: "10 min" }] },
            { day: "Tuesday", meals: [{ id: 502, type: "Lunch", name: "Vegetable Pulao", calories: 450, protein: 10, carbs: 80, fat: 12 }] },
            { day: "Wednesday", meals: [{ id: 503, type: "Dinner", name: "Dal Makhani & Roti", calories: 500, protein: 15, carbs: 70, fat: 20 }] },
            { day: "Thursday", meals: [{ id: 504, type: "Breakfast", name: "Idli Sambar", calories: 350, protein: 12, carbs: 65, fat: 5 }] },
            { day: "Friday", meals: [{ id: 505, type: "Lunch", name: "Paneer Wrap", calories: 500, protein: 20, carbs: 50, fat: 25 }] },
            { day: "Saturday", meals: [{ id: 506, type: "Dinner", name: "Mixed Veg Curry", calories: 400, protein: 12, carbs: 60, fat: 15 }] },
            { day: "Sunday", meals: [{ id: 507, type: "Breakfast", name: "Upma", calories: 300, protein: 8, carbs: 55, fat: 10 }] }
        ],
        "Non-Veg": [
            { day: "Monday", meals: [{ id: 601, type: "Breakfast", name: "Omelette Sandwich", calories: 400, protein: 20, carbs: 35, fat: 15, tags: ["Balanced"], image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?w=500&q=80", ingredients: ["2 Eggs", "Bread"], prepTime: "10 min" }] },
            { day: "Tuesday", meals: [{ id: 602, type: "Lunch", name: "Chicken Stew", calories: 500, protein: 35, carbs: 30, fat: 15 }] },
            { day: "Wednesday", meals: [{ id: 603, type: "Dinner", name: "Baked Chicken Wings", calories: 600, protein: 40, carbs: 5, fat: 45 }] },
            { day: "Thursday", meals: [{ id: 604, type: "Breakfast", name: "Scrambled Eggs on Toast", calories: 450, protein: 25, carbs: 40, fat: 20 }] },
            { day: "Friday", meals: [{ id: 605, type: "Lunch", name: "Prawn Curry", calories: 550, protein: 45, carbs: 10, fat: 25 }] },
            { day: "Saturday", meals: [{ id: 606, type: "Dinner", name: "Grilled Lamb Chops", calories: 700, protein: 50, carbs: 0, fat: 55 }] },
            { day: "Sunday", meals: [{ id: 607, type: "Breakfast", name: "Egg Bhurji", calories: 350, protein: 18, carbs: 10, fat: 25 }] }
        ]
    }
};
