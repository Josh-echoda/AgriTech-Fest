import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, FileUp, RotateCcw, Save } from 'lucide-react';
import { submitBattlefieldApplication } from '../lib/api';
import './battlefield-application.css';

type Answer = string | string[] | boolean;
type Answers = Record<string, Answer>;
type Kind = 'text' | 'email' | 'tel' | 'date' | 'number' | 'url' | 'textarea' | 'single' | 'multi' | 'select' | 'file' | 'declarations';
type Question = {
  id: string; section: string; title: string; kind: Kind; required?: boolean; help?: string;
  options?: string[]; maxWords?: number; multiple?: boolean; accept?: string;
  show?: (answers: Answers) => boolean;
  disqualifyOn?: string[];
};

const DRAFT_KEY = 'agritech-battlefield-draft-v1';
const yesNo = ['Yes', 'No'];
const states = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','Federal Capital Territory'];
const declarations = [
  'The information provided is accurate and complete.',
  'This innovation is our original work, or we have permission to use all relevant intellectual property.',
  'I understand that submitting does not guarantee selection.',
  'I understand that shortlisted applicants may undergo interviews, verification and due diligence.',
  'I am available for interviews, the accelerator, pitch sessions and AgriTech Fest 2026 if selected.',
  'I understand that false information, plagiarism or misrepresentation may result in disqualification.',
  'The organisers may contact me about this application and related programme activities.',
  'I consent to processing my information for assessment and programme administration.',
  'If selected, approved photos, videos, team names and innovation descriptions may be used for promotion.',
];

const q = (id: string, section: string, title: string, kind: Kind, extra: Partial<Question> = {}): Question => ({ id, section, title, kind, required: true, ...extra });

const questions: Question[] = [
  q('age_eligible','Eligibility check','Are you between 18 and 35 years old?','single',{options:yesNo,disqualifyOn:['No']}),
  q('applicant_profile','Eligibility check','Which best describes you?','single',{options:['University student','Polytechnic student','College of Agriculture student','Recent graduate','Young researcher','Member of a student-led startup','Other']}),
  q('applicant_profile_other','Eligibility check','How would you describe yourself?','text',{show:a=>a.applicant_profile==='Other'}),
  q('available','Eligibility check','Can you join virtual interviews, training and the final event in Kano if selected?','single',{options:yesNo,disqualifyOn:['No']}),
  q('agriculture_focus','Eligibility check','Does your innovation address agriculture or the food system?','single',{options:yesNo,disqualifyOn:['No']}),

  q('application_type','Application type','Are you applying as an individual or a team?','single',{options:['Individual','Team']}),
  q('team_name','Application type','What is the name of your innovation or team?','text'),
  q('team_size','Application type','How many people are on your team?','single',{options:['1','2','3'],help:'Teams may contain a maximum of three members.'}),

  q('full_name','About you','What is your full name?','text'),
  q('email','About you','What email address should we use?','email'),
  q('phone','About you','What is your phone or WhatsApp number?','tel',{help:'Include your country code where applicable.'}),
  q('date_of_birth','About you','What is your date of birth?','date'),
  q('gender','About you','How do you describe your gender?','single',{required:false,options:['Female','Male','Prefer not to say','Other']}),
  q('state','About you','Which state do you currently live in?','select',{options:states}),
  q('city','About you','What is your city or local government area?','text'),
  q('institution','About you','What is your current institution or organisation?','text',{help:'Enter “Independent” if you are not currently affiliated.'}),
  q('department','About you','What is your department, course or area of study or research?','text'),
  q('professional_status','About you','What is your current academic or professional status?','select',{options:['Undergraduate student','Postgraduate student','Polytechnic student','College of Agriculture student','Recent graduate','Researcher','Entrepreneur','Other']}),
  q('graduation_year','About you','What is your expected or actual graduation year?','number',{required:false}),
  q('identity_document','About you','Upload a valid means of identification.','file',{accept:'.pdf,.jpg,.jpeg,.png',help:'PDF, JPG or PNG · maximum 5 MB'}),
  q('status_document','About you','Upload proof of your student, graduate or researcher status.','file',{required:false,accept:'.pdf,.jpg,.jpeg,.png',help:'PDF, JPG or PNG · maximum 5 MB'}),

  ...[2,3].flatMap(member => [
    q(`member_${member}_name`,`Team member ${member}`,`What is team member ${member}’s full name?`,'text',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_email`,`Team member ${member}`,`What is their email address?`,'email',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_phone`,`Team member ${member}`,`What is their phone or WhatsApp number?`,'tel',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_institution`,`Team member ${member}`,`What is their institution or organisation?`,'text',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_expertise`,`Team member ${member}`,`What is their course, department or area of expertise?`,'text',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_role`,`Team member ${member}`,`What role do they play on the team?`,'text',{show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
    q(`member_${member}_skills`,`Team member ${member}`,`Briefly describe their relevant skills or experience.`,'textarea',{maxWords:150,show:a=>a.application_type==='Team' && Number(a.team_size)>=member}),
  ]),

  q('innovation_name','Innovation overview','What is the name of your innovation?','text'),
  q('category','Innovation overview','Which category best describes it?','single',{options:['Precision Agriculture and Smart Farming','Mechanisation and Farm Tools','Climate-Smart Agriculture','Post-Harvest and Food Processing','Agricultural Finance and Market Access','Livestock and Animal Agriculture','Agricultural Biotechnology and Inputs','Food Systems and Circular Agriculture','Other']}),
  q('category_other','Innovation overview','What category would you use?','text',{show:a=>a.category==='Other'}),
  q('stage','Innovation overview','What stage is your innovation currently at?','single',{options:['Idea or concept stage','Research stage','Early design stage','Prototype under development','Working prototype','Pilot stage','Early-market stage','Already generating revenue']}),
  q('one_sentence','Innovation overview','Describe your innovation in one sentence.','textarea',{maxWords:40}),
  q('overview','Innovation overview','Give us a brief overview of your innovation.','textarea',{maxWords:250,help:'Explain what it is, what it does and the agricultural problem it addresses.'}),

  q('problem','Problem and users','What specific agricultural or food-system problem are you solving?','textarea',{maxWords:300}),
  q('affected_users','Problem and users','Who experiences this problem?','multi',{options:['Smallholder farmers','Commercial farmers','Livestock farmers','Agricultural processors','Distributors','Retailers','Consumers','Agricultural cooperatives','Government agencies','Financial institutions','Other']}),
  q('problem_location','Problem and users','Where does this problem occur?','text',{help:'Identify the communities, states, regions or markets affected.'}),
  q('problem_scale','Problem and users','How serious or widespread is the problem?','textarea',{maxWords:200}),
  q('problem_discovery','Problem and users','How did you or your team identify or experience it?','textarea',{maxWords:200}),

  q('solution','Proposed solution','Describe your proposed solution.','textarea',{maxWords:400}),
  q('solution_working','Proposed solution','How does your solution work?','textarea',{maxWords:300}),
  q('differentiation','Proposed solution','What makes it innovative or different?','textarea',{maxWords:250}),
  q('alternatives','Proposed solution','What alternatives or competing solutions exist?','textarea',{maxWords:200}),
  q('why_choose','Proposed solution','Why would users choose your solution?','textarea',{maxWords:200}),
  q('special_infrastructure','Proposed solution','Does it require special infrastructure or technology?','single',{options:yesNo}),
  q('infrastructure_details','Proposed solution','What infrastructure or technology is required?','textarea',{maxWords:200,show:a=>a.special_infrastructure==='Yes'}),

  q('prototype_status','Prototype and validation','Do you currently have a prototype, demo or minimum viable product?','single',{options:['Yes, we have a working prototype','Yes, but it is still under development','No, but we have completed the design','No, we are currently at concept stage']}),
  q('prototype_files','Prototype and validation','Upload photos, diagrams or screenshots of your solution.','file',{required:false,multiple:true,accept:'.pdf,.jpg,.jpeg,.png',help:'Up to five PDF, JPG or PNG files · maximum 10 MB each'}),
  q('prototype_url','Prototype and validation','Do you have a prototype, demo or website link?','url',{required:false}),
  q('user_testing','Prototype and validation','Have you tested the solution with potential users?','single',{options:['Yes','No','Testing is currently in progress']}),
  q('testing_learnings','Prototype and validation','Who did you test it with, and what did you learn?','textarea',{maxWords:300,show:a=>a.user_testing==='Yes'||a.user_testing==='Testing is currently in progress'}),
  q('tester_count','Prototype and validation','How many people or organisations have tested or used it?','number',{required:false}),
  q('evidence','Prototype and validation','What evidence do you currently have?','multi',{options:['User interviews','Farmer feedback','Survey results','Prototype testing','Pilot results','Letters of interest','Paying customers','Revenue','Institutional partnership','Research findings','None yet','Other']}),
  q('evidence_files','Prototype and validation','Upload any supporting evidence.','file',{required:false,multiple:true,accept:'.pdf,.docx,.jpg,.jpeg,.png',help:'Up to three PDF, DOCX, JPG or PNG files · maximum 10 MB each'}),

  q('primary_customer','Market and business model','Who is your primary customer?','textarea',{maxWords:150}),
  q('users_and_payers','Market and business model','Who will use the solution, and who will pay for it?','textarea',{maxWords:200}),
  q('revenue_model','Market and business model','How will the innovation generate revenue or sustain operations?','multi',{options:['Direct product sales','Subscription','Commission','Licensing','Service fees','Leasing','Business-to-business contracts','Government or institutional contracts','Grant-supported model','Advertising','Not yet determined','Other']}),
  q('business_model','Market and business model','Briefly explain your business model.','textarea',{maxWords:250}),
  q('pricing','Market and business model','What will you charge, or how will pricing be determined?','textarea',{required:false,maxWords:150}),
  q('market_size','Market and business model','How large is your potential target market?','textarea',{maxWords:200}),
  q('has_revenue','Market and business model','Have you generated revenue from this innovation?','single',{options:yesNo}),
  q('revenue_details','Market and business model','What revenue has been generated, and over what period?','text',{show:a=>a.has_revenue==='Yes'}),

  q('resources','Feasibility and impact','What resources are required to develop or deploy your solution?','textarea',{maxWords:250}),
  q('risks','Feasibility and impact','What are the most significant technical or operational risks?','textarea',{maxWords:200}),
  q('impact_types','Feasibility and impact','What measurable impact could your solution create?','multi',{options:['Increased agricultural productivity','Reduced production costs','Reduced food loss or waste','Increased farmer income','Improved access to finance','Improved market access','Job creation','Water conservation','Improved soil health','Reduced environmental impact','Improved food quality or safety','Better livestock health or productivity','Other']}),
  q('impact_details','Feasibility and impact','Describe the economic, social or environmental impact you expect.','textarea',{maxWords:300}),
  q('first_year_reach','Feasibility and impact','How many farmers, businesses or users could you reach in year one?','text'),
  q('scale_plan','Feasibility and impact','How can this grow from a local solution into a regional or national one?','textarea',{maxWords:250}),
  q('milestones','Feasibility and impact','What milestones will you achieve in the next 12 months?','textarea',{maxWords:250}),

  q('team_qualification','Team strength','Why are you or your team qualified to solve this problem?','textarea',{maxWords:250}),
  q('team_experience','Team strength','What relevant technical, agricultural, research or business experience do you have?','textarea',{maxWords:250}),
  q('time_working','Team strength','How long have you been working on this innovation?','single',{options:['Less than one month','1–3 months','4–6 months','7–12 months','More than one year']}),
  q('weekly_hours','Team strength','How many hours per week can the team dedicate?','single',{options:['Fewer than 5 hours','5–10 hours','11–20 hours','More than 20 hours','Full-time']}),
  q('motivation','Team strength','Why do you want to participate in AgriTech Battlefield 2026?','textarea',{maxWords:250}),

  q('support_needed','Support required','What support does your innovation currently need?','multi',{options:['Funding','Mentorship','Product development','Technical expertise','Business-model development','Market validation','Access to farmers','Pilot opportunities','Manufacturing support','Regulatory guidance','Branding and marketing','Investor introductions','Technology partnership','Distribution or market access','Other']}),
  q('accelerator_goal','Support required','What would you aim to achieve during the Battlefield Accelerator?','textarea',{maxWords:250}),
  q('funding_use','Support required','How would you use available funding or pilot support?','textarea',{maxWords:250}),

  q('previous_programme','Previous programmes','Has this innovation entered another competition, accelerator or incubator?','single',{options:yesNo}),
  q('programme_details','Previous programmes','Tell us the programme name, date and outcome.','textarea',{maxWords:150,show:a=>a.previous_programme==='Yes'}),
  q('received_funding','Previous programmes','Has the innovation received funding, a prize, grant or investment?','single',{options:yesNo}),
  q('funding_details','Previous programmes','Provide the source, amount and purpose of the funding or award.','textarea',{maxWords:150,show:a=>a.received_funding==='Yes'}),
  q('discovery_source','Previous programmes','How did you hear about AgriTech Battlefield?','single',{options:['Social media','University or institution','Lecturer or supervisor','Friend or colleague','Kano Agri-Tech Fest website','Partner organisation','Media publication','WhatsApp','Email','Other']}),

  q('declarations','Declaration','Before submitting, please confirm each declaration.','declarations',{options:declarations}),
  q('declaration_name','Declaration','Type the lead applicant’s full name.','text'),
  q('signature','Declaration','Add your electronic signature.','text',{help:'Type your full name as your electronic signature.'}),
  q('declaration_date','Declaration','What is today’s date?','date'),
];

function wordCount(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0; }

export default function BattlefieldApplication({ onComplete }: { onComplete?: () => void }) {
  const restored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') as { answers?: Answers; step?: number }; }
    catch { return {}; }
  }, []);
  const [answers, setAnswers] = useState<Answers>(restored.answers || {});
  const [step, setStep] = useState(restored.step || 0);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [status, setStatus] = useState<'editing'|'submitting'|'complete'|'disqualified'|'error'>('editing');
  const [reference, setReference] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const visible = questions.filter(question => !question.show || question.show(answers));
  const current = visible[Math.min(step, visible.length - 1)];
  const currentIndex = Math.min(step, visible.length - 1);
  const progress = ((currentIndex + 1) / visible.length) * 100;

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step: currentIndex, savedAt: new Date().toISOString() }));
  }, [answers, currentIndex]);
  useEffect(() => { inputRef.current?.focus(); }, [currentIndex]);

  const setAnswer = (value: Answer) => setAnswers(previous => ({ ...previous, [current.id]: value }));
  const value = answers[current?.id];
  const isAnswered = !current?.required || (current.kind === 'file' ? Boolean(files[current.id]?.length) : current.kind === 'declarations' ? Array.isArray(value) && value.length === current.options?.length : Array.isArray(value) ? value.length > 0 : typeof value === 'boolean' ? value : String(value || '').trim().length > 0);
  const withinLimit = !current?.maxWords || wordCount(String(value || '')) <= current.maxWords;

  const next = () => {
    if (!isAnswered || !withinLimit) return;
    if (current.disqualifyOn?.includes(String(value))) {
      setStatus('disqualified');
      return;
    }
    setStep(index => Math.min(index + 1, visible.length - 1));
  };

  const chooseSingle = (option: string) => {
    setAnswers(previous => ({ ...previous, [current.id]: option }));
    if (current.disqualifyOn?.includes(option)) {
      window.setTimeout(() => setStatus('disqualified'), 180);
      return;
    }
    window.setTimeout(() => setStep(index => Math.min(index + 1, visible.length - 1)), 180);
  };

  const toggleMulti = (option: string) => {
    const selected = Array.isArray(value) ? value : [];
    const nextValues = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option];
    setAnswer(option === 'None yet' ? ['None yet'] : nextValues.filter(item => item !== 'None yet'));
  };

  const submit = async () => {
    if (!isAnswered || !withinLimit) return;
    const missingRequiredFile = visible.findIndex(question => question.kind === 'file' && question.required && !files[question.id]?.length);
    if (missingRequiredFile >= 0) {
      setStep(missingRequiredFile);
      return;
    }    setStatus('submitting');
    try {
      const result = await submitBattlefieldApplication(answers, files);
      setReference(result.reference_code);
      localStorage.removeItem(DRAFT_KEY);
      setStatus('complete');
      onComplete?.();
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    localStorage.removeItem(DRAFT_KEY); setAnswers({}); setFiles({}); setStep(0); setStatus('editing'); setReference('');
  };

  if (status === 'disqualified') return (
    <section id="battleform" className="battle-conversation battle-complete battle-disqualified" aria-live="polite">
      <p className="battle-step-label">Eligibility check complete</p>
      <h2>This application cannot continue.</h2>
      <p>Based on the response provided, this application does not meet the current eligibility requirements for AgriTech Battlefield 2026.</p>
      <p className="battle-saved-note">If you selected the wrong answer, you can restart the application.</p>
      <button type="button" className="battle-next battle-restart" onClick={reset}><RotateCcw size={16}/> Restart eligibility check</button>
    </section>
  );

  if (status === 'complete') return (
    <section id="battleform" className="battle-conversation battle-complete" aria-live="polite">
      <div className="battle-complete-icon"><Check /></div>
      <p className="battle-step-label">Application received</p>
      <h2>Your idea has entered the arena.</h2>
      <p>Keep this application reference for future communication.</p>
      <strong className="battle-reference">{reference}</strong>
      <p className="battle-saved-note">Shortlisted applicants will be contacted with details of the next stage.</p>
    </section>
  );

  return (
    <section id="battleform" className="battle-conversation" aria-labelledby="battle-question">
      <header className="battle-progress-header">
        <div><span>{current.section}</span><strong>{currentIndex + 1} of {visible.length}</strong></div>
        <div className="battle-progress-track" aria-label={`${Math.round(progress)}% complete`}><i style={{ width: `${progress}%` }} /></div>
        <p><Save size={14} /> Answers save automatically on this device</p>
      </header>

      <div className="battle-question-card" key={current.id}>
        <p className="battle-step-label">Let&apos;s continue</p>
        <h2 id="battle-question">{current.title}</h2>
        {current.help && <p className="battle-question-help">{current.help}</p>}

        <div className="battle-answer-area">
          {(current.kind === 'text' || current.kind === 'email' || current.kind === 'tel' || current.kind === 'date' || current.kind === 'number' || current.kind === 'url') && (
            <input ref={inputRef as React.RefObject<HTMLInputElement>} type={current.kind} value={String(value || '')} onChange={event => setAnswer(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); next(); } }} placeholder="Type your answer…" />
          )}
          {current.kind === 'textarea' && <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} rows={6} value={String(value || '')} onChange={event => setAnswer(event.target.value)} placeholder="Tell us in your own words…" />}
          {current.kind === 'select' && <select ref={inputRef as React.RefObject<HTMLSelectElement>} value={String(value || '')} onChange={event => setAnswer(event.target.value)}><option value="">Choose an answer</option>{current.options?.map(option=><option key={option}>{option}</option>)}</select>}
          {current.kind === 'single' && <div className="battle-choice-grid">{current.options?.map(option=><button type="button" key={option} className={value===option?'selected':''} onClick={()=>chooseSingle(option)}><span>{option}</span>{value===option&&<Check size={18}/>}</button>)}</div>}
          {(current.kind === 'multi' || current.kind === 'declarations') && <div className={`battle-chip-list ${current.kind==='declarations'?'is-declarations':''}`}>{current.options?.map(option=>{const selected=Array.isArray(value)&&value.includes(option);return <button type="button" key={option} className={selected?'selected':''} onClick={()=>toggleMulti(option)}><i>{selected&&<Check size={13}/>}</i><span>{option}</span></button>})}</div>}
          {current.kind === 'file' && <label className="battle-file-input"><FileUp size={30}/><strong>{files[current.id]?.length ? `${files[current.id].length} file${files[current.id].length>1?'s':''} selected` : 'Choose file'}</strong><span>Files are uploaded securely when you submit.</span><input type="file" accept={current.accept} multiple={current.multiple} onChange={event=>{const selected=Array.from(event.target.files||[]);setFiles(previous=>({...previous,[current.id]:selected}));setAnswer(selected.map(file=>file.name));}} /></label>}
          {current.maxWords && <p className={`battle-word-count ${withinLimit?'':'over'}`}>{wordCount(String(value || ''))} / {current.maxWords} words</p>}
        </div>

        {status==='error' && <p className="battle-error" role="alert">We couldn&apos;t submit right now. Your answers are still saved—please try again.</p>}
        <footer className="battle-question-actions">
          <button type="button" className="battle-back" disabled={currentIndex===0} onClick={()=>setStep(index=>Math.max(0,index-1))}>Back</button>
          {currentIndex < visible.length - 1 ? <button type="button" className="battle-next" disabled={!isAnswered||!withinLimit} onClick={next}>Continue</button> : <button type="button" className="battle-next" disabled={!isAnswered||!withinLimit||status==='submitting'} onClick={submit}>{status==='submitting'?'Entering the arena…':'Enter the Battlefield'}</button>}
        </footer>
      </div>

      <button type="button" className="battle-reset" onClick={reset}><RotateCcw size={14}/> Start over and clear saved answers</button>
    </section>
  );
}
