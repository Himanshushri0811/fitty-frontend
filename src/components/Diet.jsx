import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import DietPlan from './DietPlan';
import GroceryList from './GroceryList';
import './Diet.css';

const DietSection = ({ userName }) => {
  // State management
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('');
  const [plan, setPlan] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  // Speech recognition setup
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening
  } = useSpeechRecognition();

  // Voice output function
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    window.speechSynthesis.speak(utterance);
  };

  // Start voice recognition
  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      setIsListening(true);
    } else {
      alert("Your browser doesn't support speech recognition");
    }
  };

  // Weekly meal plan data
  const weeklyPlan = Array(7).fill().map((_, i) => ({
    day: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'][i],
    meals: plan?.meals || {}
  }));

  // Voice prompts based on step
  useEffect(() => {
    if (step === 1) {
      speak(`${userName}, आपका गोल क्या है? Weight Gain, Weight Loss, या Maintenance?`);
    } else if (step === 2) {
      speak(`आप Veg या Non-Veg डाइट फॉलो करेंगे?`);
    }
  }, [step, userName]);

  // Handle voice input
  useEffect(() => {
    if (!transcript || !isListening) return;

    const lowerTranscript = transcript.toLowerCase();
    
    if (step === 1) {
      if (lowerTranscript.includes('weight gain') || lowerTranscript.includes('वेट गेन')) {
        setGoal('weight_gain');
        setStep(2);
      } else if (lowerTranscript.includes('weight loss') || lowerTranscript.includes('वेट लॉस')) {
        setGoal('weight_loss');
        setStep(2);
      } else if (lowerTranscript.includes('maintenance') || lowerTranscript.includes('मेंटेनेंस')) {
        setGoal('maintenance');
        setStep(2);
      } else if (lowerTranscript.includes('मेरा गोल') || lowerTranscript.includes('मेरा लक्ष्य')) {
        // Handle natural language input
        if (lowerTranscript.includes('बढ़ाना') || lowerTranscript.includes('गेन')) {
          setGoal('weight_gain');
          setStep(2);
        } else if (lowerTranscript.includes('घटाना') || lowerTranscript.includes('लॉस')) {
          setGoal('weight_loss');
          setStep(2);
        } else if (lowerTranscript.includes('बनाए रखना') || lowerTranscript.includes('मेंटेन')) {
          setGoal('maintenance');
          setStep(2);
        }
      }
    } else if (step === 2) {
      if (lowerTranscript.includes('veg') || lowerTranscript.includes('वेज') || lowerTranscript.includes('शाकाहारी')) {
        setDietType('veg');
        generateDietPlan();
      } else if (lowerTranscript.includes('non veg') || lowerTranscript.includes('नॉन वेज') || lowerTranscript.includes('मांसाहारी')) {
        setDietType('non_veg');
        generateDietPlan();
      }
    }
    
    setIsListening(false);
    resetTranscript();
  }, [transcript, isListening, step]);

  // Generate diet plan (mock data)
  const generateDietPlan = () => {
    // Different plans for different goals
    const plans = {
      weight_gain: {
        veg: {
          meals: {
            breakfast: { name: 'ओट्स + दूध + केला + बादाम', calories: 500 },
            lunch: { name: 'चावल + दाल + पनीर + घी', calories: 700 },
            dinner: { name: 'रोटी + सब्जी + दही + मक्खन', calories: 600 }
          },
          grocery_list: ['ओट्स', 'दूध', 'केला', 'बादाम', 'चावल', 'दाल', 'पनीर', 'घी']
        },
        non_veg: {
          meals: {
            breakfast: { name: 'अंडे + ब्राउन ब्रेड + एवोकाडो', calories: 550 },
            lunch: { name: 'चिकन + राइस + सलाद + घी', calories: 800 },
            dinner: { name: 'फिश + रोटी + सूप', calories: 650 }
          },
          grocery_list: ['अंडे', 'ब्राउन ब्रेड', 'एवोकाडो', 'चिकन', 'राइस', 'सलाद', 'फिश']
        }
      },
      weight_loss: {
        veg: {
          meals: {
            breakfast: { name: 'मूंग दाल चीला + हरी चटनी', calories: 300 },
            lunch: { name: 'ज्वार की रोटी + लौकी की सब्जी', calories: 400 },
            dinner: { name: 'स्प्राउट्स सलाद + सूप', calories: 350 }
          },
          grocery_list: ['मूंग दाल', 'हरी चटनी', 'ज्वार का आटा', 'लौकी', 'स्प्राउट्स']
        },
        non_veg: {
          meals: {
            breakfast: { name: 'बॉइल्ड एग्स + ग्रीन टी', calories: 250 },
            lunch: { name: 'ग्रिल्ड चिकन + क्विनोआ', calories: 450 },
            dinner: { name: 'स्टीम्ड फिश + ब्रोकली', calories: 400 }
          },
          grocery_list: ['अंडे', 'ग्रीन टी', 'चिकन', 'क्विनोआ', 'फिश', 'ब्रोकली']
        }
      },
      maintenance: {
        veg: {
          meals: {
            breakfast: { name: 'पोहा + दूध + नट्स', calories: 400 },
            lunch: { name: 'रोटी + दाल + सब्जी + दही', calories: 500 },
            dinner: { name: 'खिचड़ी + सलाद', calories: 450 }
          },
          grocery_list: ['पोहा', 'दूध', 'नट्स', 'रोटी', 'दाल', 'सब्जी', 'दही']
        },
        non_veg: {
          meals: {
            breakfast: { name: 'अंडे की भुर्जी + ब्राउन ब्रेड', calories: 400 },
            lunch: { name: 'चिकन करी + ब्राउन राइस', calories: 550 },
            dinner: { name: 'फिश ग्रिल + सब्जियां', calories: 500 }
          },
          grocery_list: ['अंडे', 'ब्राउन ब्रेड', 'चिकन', 'ब्राउन राइस', 'फिश']
        }
      }
    };

    const selectedPlan = plans[goal]?.[dietType];
    if (selectedPlan) {
      setPlan(selectedPlan);
      speak(`${userName}, आपका ${goal.replace('_', ' ')} डाइट प्लान तैयार है! सुबह ${selectedPlan.meals.breakfast.name}, दोपहर ${selectedPlan.meals.lunch.name}, और रात ${selectedPlan.meals.dinner.name} खाएं।`);
    }
  };

  // Add water intake
  const addWaterIntake = () => {
    const newIntake = waterIntake + 1;
    setWaterIntake(newIntake);
    
    if (newIntake % 3 === 0) {
      const message = `💧 ${newIntake} गिलास पानी पी लिया!`;
      setNotifications([...notifications, message]);
      speak(message);
    }
  };

  // Daily progress notification
  useEffect(() => {
    if (plan) {
      const timer = setTimeout(() => {
        const message = `${userName}, आज का आपका डाइट प्लान शुरू करने का समय हो गया है!`;
        setNotifications([...notifications, message]);
        speak(message);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [plan]);

  return (
    <div className="diet-container">
      {/* Setup Section */}
      {!plan ? (
        <div className="setup-section">
          {/* Step 1: Goal Selection */}
          {step === 1 && (
            <div className="goal-selection">
              <h2>आपका गोल क्या है?</h2>
              <div className="options">
                <button 
                  onClick={() => { setGoal('weight_gain'); setStep(2); }}
                  className={goal === 'weight_gain' ? 'active' : ''}
                >
                  Weight Gain
                </button>
                <button 
                  onClick={() => { setGoal('weight_loss'); setStep(2); }}
                  className={goal === 'weight_loss' ? 'active' : ''}
                >
                  Weight Loss
                </button>
                <button 
                  onClick={() => { setGoal('maintenance'); setStep(2); }}
                  className={goal === 'maintenance' ? 'active' : ''}
                >
                  Maintenance
                </button>
              </div>
              {transcript && <p className="voice-transcript">आपने कहा: {transcript}</p>}
              <p className="voice-tip">या बोलें: "मेरा गोल वेट गेन है"</p>
            </div>
          )}

          {/* Step 2: Diet Type Selection */}
          {step === 2 && (
            <div className="diet-type-selection">
              <h2>आप कौन-सा डाइट फॉलो करेंगे?</h2>
              <div className="options">
                <button 
                  onClick={() => { setDietType('veg'); generateDietPlan(); }}
                  className={dietType === 'veg' ? 'active' : ''}
                >
                  Veg
                </button>
                <button 
                  onClick={() => { setDietType('non_veg'); generateDietPlan(); }}
                  className={dietType === 'non_veg' ? 'active' : ''}
                >
                  Non-Veg
                </button>
              </div>
              {transcript && <p className="voice-transcript">आपने कहा: {transcript}</p>}
              <p className="voice-tip">या बोलें: "मैं वेज डाइट चुनता हूँ"</p>
            </div>
          )}
        </div>
      ) : (
        /* Plan Display Section */
        <div className="plan-section">
          {/* Header with User Info */}
          <div className="user-header">
            <h2>{userName} का डाइट प्लान</h2>
            <p className="goal-info">
              गोल: {goal.replace('_', ' ')} | डाइट: {dietType === 'veg' ? 'शाकाहारी' : 'मांसाहारी'}
            </p>
          </div>

          {/* Weekly Navigation */}
          <div className="weekly-tabs">
            {weeklyPlan.map((dayPlan, index) => (
              <button 
                key={index} 
                className={index === selectedDay ? 'active' : ''}
                onClick={() => setSelectedDay(index)}
              >
                {dayPlan.day}
              </button>
            ))}
          </div>

          {/* Diet Plan Component */}
          <DietPlan plan={weeklyPlan[selectedDay]} />

          {/* Grocery List Component */}
          <GroceryList plan={plan} />

          {/* Water Tracker */}
          <div className="water-tracker">
            <h3>💧 पानी: {waterIntake} / 8 गिलास</h3>
            <div className="water-progress">
              {Array(8).fill().map((_, i) => (
                <div 
                  key={i} 
                  className={`water-bar ${i < waterIntake ? 'filled' : ''}`}
                  onClick={() => setWaterIntake(i + 1)}
                ></div>
              ))}
            </div>
            <button onClick={addWaterIntake} className="add-water">
              + 1 गिलास जोड़ें
            </button>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notifications">
              <h3>🔔 रिमाइंडर्स</h3>
              <div className="notification-list">
                {notifications.map((msg, i) => (
                  <div key={i} className="notification">
                    <p>{msg}</p>
                    <button 
                      onClick={() => setNotifications(notifications.filter((_, idx) => idx !== i))}
                      className="close-notification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setNotifications([])} 
                className="clear-all"
              >
                सभी साफ करें
              </button>
            </div>
          )}

          {/* Reset Button */}
          <button 
            onClick={() => {
              setPlan(null);
              setStep(1);
              setGoal('');
              setDietType('');
              setWaterIntake(0);
              setNotifications([]);
            }} 
            className="reset-btn"
          >
            नया प्लान बनाएं
          </button>
        </div>
      )}
    </div>
  );
};

export default DietSection;