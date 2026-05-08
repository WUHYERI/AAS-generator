import { Loader2 } from 'lucide-react';

type Props = {
  isGenerating?: boolean;
  //   onclick: () => void;
};

export default function Button({ isGenerating }: Props) {
  return (
    <button
      disabled={isGenerating}
      className="w-full px-6 py-3 max-w-2xl bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors"
    >
      {isGenerating ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-5">Generate AAS</div>
      )}
    </button>
  );
}
