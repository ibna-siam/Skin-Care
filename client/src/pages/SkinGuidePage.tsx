import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { skinGuideService } from '../services/skinGuide.service';
import { publicMediaService } from '../services/admin.service';
import { useCartStore } from '../stores/cartStore';
import { Sparkles, Sun, Moon, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import { formatBDT, SkinQuizResult } from '@skincare/shared';
import confetti from 'canvas-confetti';

export const SkinGuidePage: React.FC = () => {
  const addToCart = useCartStore((state) => state.addToCart);

  // Quiz progression state
  const [currentStep, setCurrentStep] = useState(1);
  const [skinTypeSlug, setSkinTypeSlug] = useState('oily');
  const [concernSlug, setConcernSlug] = useState('acne');
  const [sensitivity, setSensitivity] = useState('LOW');
  const [gender, setGender] = useState('ALL');

  const [routineResult, setRoutineResult] = useState<SkinQuizResult | null>(null);
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(false);

  // Fetch Dynamic Website Media Slots
  const { data: mediaSlots = {} } = useQuery({
    queryKey: ['public-media-slots'],
    queryFn: () => publicMediaService.getSlots(),
  });

  // Questions query
  const { data: questions = [] } = useQuery({
    queryKey: ['skin-quiz-questions'],
    queryFn: () => skinGuideService.getQuestions(),
  });

  const handleFinishQuiz = async () => {
    setIsLoadingRoutine(true);
    try {
      const result = await skinGuideService.submitQuiz({
        skinTypeSlug,
        concernSlug,
        sensitivity,
        gender,
      });
      if (result) {
        setRoutineResult(result);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert(err.message || 'Error generating routine');
    } finally {
      setIsLoadingRoutine(false);
    }
  };

  const handleAddBundleToCart = () => {
    if (!routineResult) return;
    const allProducts = [
      ...routineResult.morningRoutine.map((r) => r.product),
      ...routineResult.nightRoutine.map((r) => r.product),
    ];
    // Deduplicate
    const uniqueIds = Array.from(new Set(allProducts.map((p) => p.id)));
    for (const id of uniqueIds) {
      addToCart(id, 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Dynamic Hero Banner (Media Slot: skin_guide.hero) */}
      <div className="relative rounded-3xl overflow-hidden shadow-soft-lg border border-cream-300/80 bg-cream-100 min-h-[220px] max-h-[340px] group">
        <img
          src={
            mediaSlots['skin_guide.hero']?.url ||
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop'
          }
          alt={mediaSlots['skin_guide.hero']?.altText || 'Find your perfect dermatologist-approved routine'}
          className="w-full h-full min-h-[220px] max-h-[340px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 w-fit mb-2">
            <Sparkles size={13} className="text-amber-400" /> Skincare Diagnostic Tool
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Find Your Perfect Skin Routine
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-xl mt-1.5">
            Answer 4 simple questions. Our rule-based diagnostic engine matches you with dermatologist-approved active formulations tailored for the Bangladesh climate.
          </p>
        </div>
      </div>

      {!routineResult ? (
        /* Quiz Steps Card */
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-12 shadow-sm space-y-8 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>Step {currentStep} of 4</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1.5 rounded-full transition-all ${
                    step <= currentStep ? 'bg-brand-800' : 'bg-cream-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Skin Type */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900">How does your skin feel midday?</h3>
                <p className="text-xs text-gray-500">Select the option that best describes your baseline skin.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { slug: 'oily', title: 'Oily & Shiny', desc: 'Excess shine across cheeks, forehead, and nose' },
                  { slug: 'dry', title: 'Dry & Tight', desc: 'Feels tight, rough, or has flaky patches' },
                  { slug: 'combination', title: 'Combination', desc: 'Oily T-zone (forehead/nose) but normal/dry cheeks' },
                  { slug: 'normal', title: 'Normal & Balanced', desc: 'Comfortable, neither oily nor dry' },
                  { slug: 'sensitive', title: 'Sensitive & Reactive', desc: 'Prone to redness, stinging, or irritation' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setSkinTypeSlug(item.slug)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      skinTypeSlug === item.slug
                        ? 'border-brand-800 bg-brand-50/50'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <p className="text-sm font-bold text-charcoal-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Continue to Next Question →
              </button>
            </div>
          )}

          {/* STEP 2: Main Skin Concern */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900">What is your primary skincare goal?</h3>
                <p className="text-xs text-gray-500">We will select potent active ingredients targeting this.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { slug: 'acne', title: 'Clear Acne & Blemishes', desc: 'Salicylic acid & Niacinamide targeting breakouts' },
                  { slug: 'dark-spots', title: 'Fade Dark Spots & Sun Pigmentation', desc: 'Vitamin C & Alpha Arbutin brightening' },
                  { slug: 'dryness', title: 'Deep Hydration & Barrier Repair', desc: 'Ceramides & Hyaluronic acid plumping' },
                  { slug: 'aging', title: 'Anti-Aging & Firming', desc: 'Retinol & Peptides for youthful elasticity' },
                  { slug: 'dullness', title: 'Instant Glow & Radiance', desc: 'Gentle AHA exfoliants & Centella water' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setConcernSlug(item.slug)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      concernSlug === item.slug
                        ? 'border-brand-800 bg-brand-50/50'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <p className="text-sm font-bold text-charcoal-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3.5 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Sensitivity Level */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900">How reactive is your skin?</h3>
                <p className="text-xs text-gray-500">Helps us adjust formulation concentration.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { val: 'LOW', title: 'Low Sensitivity', desc: 'Rarely experiences burning, stinging, or allergic reactions' },
                  { val: 'MEDIUM', title: 'Medium Sensitivity', desc: 'Occasional redness or tingling with strong new actives' },
                  { val: 'HIGH', title: 'High Sensitivity', desc: 'Easily irritated, needs fragrance-free hypoallergenic formulas' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setSensitivity(item.val)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      sensitivity === item.val
                        ? 'border-brand-800 bg-brand-50/50'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <p className="text-sm font-bold text-charcoal-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setCurrentStep(2)} className="px-6 py-3.5 border border-gray-300 rounded-xl text-xs font-semibold">Back</button>
                <button onClick={() => setCurrentStep(4)} className="flex-1 py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 4: Gender & Generate */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900">Who is this routine for?</h3>
                <p className="text-xs text-gray-500">Optional gender targeting for beard care and formulation preference.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['ALL', 'MEN', 'WOMEN'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      gender === g ? 'border-brand-800 bg-brand-50 font-bold text-brand-900' : 'border-cream-300 hover:bg-cream-50 text-gray-700'
                    }`}
                  >
                    {g === 'ALL' ? 'Unisex / Any' : g === 'MEN' ? 'Men' : 'Women'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setCurrentStep(3)} className="px-6 py-3.5 border border-gray-300 rounded-xl text-xs font-semibold">Back</button>
                <button
                  onClick={handleFinishQuiz}
                  disabled={isLoadingRoutine}
                  className="flex-1 py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  {isLoadingRoutine ? 'Analyzing & Building Routine...' : 'Generate My Skincare Routine ✨'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Routine Result View */
        <div className="space-y-10 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800">Your Diagnostic Profile</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
                  Tailored Routine for {routineResult.skinType.toUpperCase()} Skin
                </h2>
                <p className="text-xs text-gray-500 mt-1">Primary Target: {routineResult.primaryConcern.toUpperCase()}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setRoutineResult(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-cream-100 flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
                <button
                  onClick={handleAddBundleToCart}
                  className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} /> Add Complete Routine to Cart
                </button>
              </div>
            </div>

            {/* Morning (AM) Routine */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
                <Sun size={18} /> Morning (AM) Routine
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routineResult.morningRoutine.map((step) => (
                  <div key={step.step} className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Step {step.step}: {step.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <img src={step.product?.images?.[0]?.url || ''} alt={step.product?.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border" />
                      <div>
                        <h4 className="font-semibold text-xs text-charcoal-900 line-clamp-1">{step.product?.name}</h4>
                        <span className="text-xs font-bold text-brand-800">{formatBDT(step.product?.price)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 italic bg-white/70 p-2 rounded-lg">"{step.howToApply}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Night (PM) Routine */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                <Moon size={18} /> Night (PM) Routine
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routineResult.nightRoutine.map((step) => (
                  <div key={step.step} className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                      Step {step.step}: {step.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <img src={step.product?.images?.[0]?.url || ''} alt={step.product?.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border" />
                      <div>
                        <h4 className="font-semibold text-xs text-charcoal-900 line-clamp-1">{step.product?.name}</h4>
                        <span className="text-xs font-bold text-brand-800">{formatBDT(step.product?.price)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 italic bg-white/70 p-2 rounded-lg">"{step.howToApply}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Tips */}
            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200/70 text-xs text-brand-900 space-y-2">
              <span className="font-bold uppercase tracking-wider block">Skincare Specialist Tips for Bangladesh:</span>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {routineResult.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
