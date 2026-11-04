import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download
} from 'lucide-react';
import { OllamaConfig } from '../types';
import { checkOllamaConnection } from '../services/ollama';
import { resetAllData, exportBackupJson } from '../services/storage';
import { useToast } from './Toast';

interface OllamaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OllamaConfig;
  onUpdateConfig: (config: OllamaConfig) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onDataReset?: () => void;
}

export const OllamaSettingsModal: React.FC<OllamaSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  isDemoMode,
  setIsDemoMode,
  onDataReset
}) => {
  const toast = useToast();
  const [hostUrl, setHostUrl] = useState<string>(config.hostUrl);
  const [model, setModel] = useState<string>(config.model);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    models?: string[];
  } | null>(null);

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await checkOllamaConnection(hostUrl);

    if (res.isConnected) {
      setTestResult({
        success: true,
        message: `Connected successfully (${res.latencyMs}ms)! Found ${res.models.length} model(s).`,
        latencyMs: res.latencyMs,
        models: res.models
      });
      onUpdateConfig({
        ...config,
        hostUrl,
        model,
        isConnected: true,
        latencyMs: res.latencyMs,
        installedModels: res.models,
        lastChecked: new Date().toISOString()
      });
      setIsDemoMode(false);
      toast.success('Local LLM Connected', 'Scope analysis will use local Ollama inference.');
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Connection timed out. Ensure Ollama is running.'
      });
      onUpdateConfig({
        ...config,
        hostUrl,
        isConnected: false,
        errorMessage: res.error
      });
      toast.info('Using Sample Mode', 'Ollama is not running locally; sample engine active.');
    }

    setIsTesting(false);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
    toast.success('Copied to Clipboard', cmd);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scopeshield-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Backup Exported', 'Downloaded complete workspace state JSON.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo projects and analyses to initial factory state?')) {
      resetAllData();
      if (onDataReset) onDataReset();
      toast.info('Workspace Reset', 'Reloaded default demo project and clean state.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#ECEAF0] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-xs text-[#17213A]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] text-[#6946D8] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17213A]">Settings & AI Configuration</h2>
              <p className="text-[11px] text-[#85899A]">Local LLM runtime, demo toggles & workspace data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Mode Toggle */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] flex items-center justify-between">
          <div>
            <span className="font-bold text-[#17213A] block">Sample / Demo Mode</span>
            <p className="text-[11px] text-[#85899A] mt-0.5">
              Enables deterministic scope analysis without requiring local GPU or Ollama server.
            </p>
          </div>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isDemoMode ? 'bg-[#6946D8]' : 'bg-[#ECEAF0]'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              isDemoMode ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Local Ollama Endpoint */}
        <div className="space-y-3">
          <label className="font-bold text-[#17213A] block">Local Ollama API Endpoint</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hostUrl}
              onChange={(e) => setHostUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1 px-3 py-2 font-mono text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
            />
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-[#FAF9F6] hover:bg-[#F0EBFF] text-[#6946D8] border border-[#ECEAF0] font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>Test Ping</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-[11px] ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#17213A] block">Model Tag</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="qwen3:4b-instruct"
            className="w-full px-3 py-2 font-mono text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
          />
          <p className="text-[10px] text-[#85899A]">Recommended: qwen3:4b-instruct, llama3.2, or mistral</p>
        </div>

        {/* Local Setup Quick Command */}
        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-2">
          <span className="font-bold text-[#17213A] text-[11px] block">Quick CLI Command for Local Setup</span>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#ECEAF0] font-mono text-[10px]">
            <code>ollama run qwen3:4b-instruct</code>
            <button
              onClick={() => handleCopyCommand('ollama run qwen3:4b-instruct')}
              className="p-1 hover:text-[#6946D8]"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-[#18A999]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Backup & Reset Data */}
        <div className="pt-3 border-t border-[#ECEAF0] flex items-center justify-between">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] font-semibold text-[11px]"
          >
            <Download className="w-3.5 h-3.5 text-[#85899A]" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

      </div>
    </div>
  );
};
