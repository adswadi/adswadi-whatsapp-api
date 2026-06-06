import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Save, Zap } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STEP_TYPES = [
  { value: 'send_message', label: 'Send Text Message', icon: '💬', color: 'purple' },
  { value: 'send_template', label: 'Send Template', icon: '📋', color: 'blue' },
  { value: 'add_tag', label: 'Add Tag', icon: '🏷️', color: 'pink' },
  { value: 'remove_tag', label: 'Remove Tag', icon: '🗑️', color: 'red' },
  { value: 'assign_agent', label: 'Assign to Agent', icon: '👤', color: 'green' },
  { value: 'wait', label: 'Wait / Delay', icon: '⏱️', color: 'yellow' },
  { value: 'end', label: 'End Flow', icon: '🔚', color: 'gray' },
]

const StepCard = ({ step, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(true)
  const stepType = STEP_TYPES.find((t) => t.value === step.type)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <GripVertical size={16} className="text-gray-300" />
        <span className="text-lg">{stepType?.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{stepType?.label || step.type}</p>
          {step.config?.text && <p className="text-xs text-gray-400 truncate">{step.config.text.slice(0, 40)}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} disabled={isFirst} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} disabled={isLast} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:bg-red-50 text-red-400 rounded">
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {/* Send message config */}
          {step.type === 'send_message' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message Text</label>
              <textarea
                value={step.config?.text || ''}
                onChange={(e) => onChange({ ...step, config: { ...step.config, text: e.target.value } })}
                placeholder="Type your message... Use {{name}}, {{phone}} for variables"
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
              <p className="text-[10px] text-gray-400 mt-1">Variables: {'{{name}}'}, {'{{phone}}'}, {'{{email}}'}</p>
            </div>
          )}

          {/* Send template config */}
          {step.type === 'send_template' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Template Name</label>
                <input
                  value={step.config?.templateName || ''}
                  onChange={(e) => onChange({ ...step, config: { ...step.config, templateName: e.target.value } })}
                  placeholder="Template name from Meta"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
                <select
                  value={step.config?.language || 'en'}
                  onChange={(e) => onChange({ ...step, config: { ...step.config, language: e.target.value } })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                >
                  {['en', 'hi', 'mr', 'ta', 'te'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Add/remove tag config */}
          {(step.type === 'add_tag' || step.type === 'remove_tag') && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tag Name</label>
              <input
                value={step.config?.tag || ''}
                onChange={(e) => onChange({ ...step, config: { ...step.config, tag: e.target.value } })}
                placeholder="e.g. qualified, interested"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
          )}

          {/* Wait config */}
          {step.type === 'wait' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Delay</label>
                <input
                  type="number"
                  value={step.config?.delay || 0}
                  onChange={(e) => onChange({ ...step, config: { ...step.config, delay: parseInt(e.target.value) || 0 } })}
                  min={0}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>
              <div className="w-28">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                <select
                  value={step.config?.unit || 'seconds'}
                  onChange={(e) => onChange({ ...step, config: { ...step.config, unit: e.target.value } })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                >
                  {['seconds', 'minutes', 'hours'].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          )}

          {step.type === 'end' && (
            <p className="text-xs text-gray-400 italic">This step ends the automation flow.</p>
          )}
        </div>
      )}
    </div>
  )
}

const FlowBuilder = ({ flow, onSave }) => {
  const [steps, setSteps] = useState(flow.steps || [])
  const [saving, setSaving] = useState(false)
  const [selectedType, setSelectedType] = useState('send_message')

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      order: steps.length,
      type: selectedType,
      config: {},
      nextStepId: null,
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (index, updatedStep) => {
    const updated = [...steps]
    updated[index] = updatedStep
    setSteps(updated)
  }

  const deleteStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const moveStep = (index, direction) => {
    const updated = [...steps]
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= updated.length) return
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    updated.forEach((s, i) => { s.order = i })
    setSteps(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/flows/${flow._id}`, {
        steps: steps.map((s, i) => ({ ...s, order: i, nextStepId: steps[i + 1]?.id || null })),
      })
      toast.success('Flow saved!')
      onSave?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save flow')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <ModalBody className="space-y-4">
        {/* Trigger info */}
        <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-brand-purple" />
            <p className="font-bold text-brand-purple text-sm">Trigger</p>
          </div>
          <p className="text-sm text-gray-700 capitalize">
            {flow.trigger?.type === 'keyword' && `Keyword match: "${flow.trigger.keywords?.join(', ')}"`}
            {flow.trigger?.type === 'first_message' && 'First message from contact'}
            {flow.trigger?.type === 'opt_in' && 'Contact opts in'}
            {flow.trigger?.type === 'schedule' && 'Scheduled trigger'}
          </p>
        </div>

        {/* Steps */}
        {steps.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm mb-2">No steps added yet</p>
            <p className="text-xs text-gray-300">Add steps below to build your automation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={step.id} className="relative">
                {i > 0 && (
                  <div className="flex justify-center my-1">
                    <div className="w-0.5 h-4 bg-gray-200 rounded" />
                  </div>
                )}
                <StepCard
                  step={step}
                  index={i}
                  onChange={(updated) => updateStep(i, updated)}
                  onDelete={() => deleteStep(i)}
                  onMoveUp={() => moveStep(i, -1)}
                  onMoveDown={() => moveStep(i, 1)}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add step */}
        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
          >
            {STEP_TYPES.map(({ value, label, icon }) => (
              <option key={value} value={value}>{icon} {label}</option>
            ))}
          </select>
          <Button variant="gradient" size="sm" leftIcon={<Plus size={14} />} onClick={addStep}>
            Add Step
          </Button>
        </div>
      </ModalBody>

      <ModalFooter>
        <p className="text-xs text-gray-400 flex-1">{steps.length} step{steps.length !== 1 ? 's' : ''} configured</p>
        <Button variant="gradient" loading={saving} onClick={handleSave} leftIcon={<Save size={14} />}>
          Save Flow
        </Button>
      </ModalFooter>
    </div>
  )
}

export default FlowBuilder
