import { useState } from 'react';
import { openApiSpec } from '../api/swagger/openapi';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const methodColors: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  get:    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  post:   { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  put:    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  delete: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const methodBadgeColors: Record<HttpMethod, string> = {
  get:    'bg-blue-600',
  post:   'bg-green-600',
  put:    'bg-orange-500',
  delete: 'bg-red-600',
};

interface EndpointProps {
  method: HttpMethod;
  path: string;
  details: {
    summary?: string;
    description?: string;
    parameters?: Array<{
      name: string;
      in: string;
      required?: boolean;
      description?: string;
      schema?: { type?: string; format?: string };
      example?: string;
    }>;
    requestBody?: {
      required?: boolean;
      content?: {
        'application/json'?: {
          schema?: { '$ref'?: string };
          example?: unknown;
        };
      };
    };
    responses?: Record<string, {
      description?: string;
      content?: {
        'application/json'?: {
          example?: unknown;
          schema?: unknown;
        };
      };
    }>;
  };
}

function Endpoint({ method, path, details }: EndpointProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = methodColors[method];
  const badgeColor = methodBadgeColors[method];

  return (
    <div className={`border ${colors.border} rounded-lg mb-3 overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-4 ${colors.bg} hover:opacity-90 transition-opacity text-left`}
      >
        <span className={`${badgeColor} text-white text-xs font-bold px-3 py-1 rounded uppercase min-w-[70px] text-center`}>
          {method}
        </span>
        <code className="font-mono text-sm font-semibold text-gray-800 flex-1">{path}</code>
        <span className="text-sm text-gray-600 hidden md:block">{details.summary}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {isOpen && (
        <div className="p-5 bg-white border-t space-y-5">
          {/* Description */}
          {details.description && (
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">{details.description}</p>
            </div>
          )}

          {/* Paramètres */}
          {details.parameters && details.parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">📌 Paramètres</h4>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border font-semibold">Nom</th>
                    <th className="text-left p-2 border font-semibold">Emplacement</th>
                    <th className="text-left p-2 border font-semibold">Type</th>
                    <th className="text-left p-2 border font-semibold">Requis</th>
                    <th className="text-left p-2 border font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {details.parameters.map((param, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 border font-mono text-xs text-purple-700">{param.name}</td>
                      <td className="p-2 border">
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{param.in}</span>
                      </td>
                      <td className="p-2 border text-xs">{param.schema?.type || 'string'}</td>
                      <td className="p-2 border">
                        {param.required ? (
                          <span className="text-red-600 font-bold text-xs">oui</span>
                        ) : (
                          <span className="text-gray-400 text-xs">non</span>
                        )}
                      </td>
                      <td className="p-2 border text-gray-600 text-xs">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Request Body */}
          {details.requestBody?.content?.['application/json'] && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">📝 Corps de la requête (JSON)</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(details.requestBody.content['application/json'].example, null, 2)}
              </pre>
            </div>
          )}

          {/* Réponses */}
          {details.responses && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2">📤 Réponses</h4>
              <div className="space-y-3">
                {Object.entries(details.responses).map(([code, response]) => (
                  <div key={code} className="border rounded-lg overflow-hidden">
                    <div className={`flex items-center gap-2 p-3 ${
                      code.startsWith('2') ? 'bg-green-50' : code.startsWith('4') ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <span className={`font-bold text-sm px-2 py-0.5 rounded ${
                        code.startsWith('2') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {code}
                      </span>
                      <span className="text-sm text-gray-700">{response.description}</span>
                    </div>
                    {response.content?.['application/json']?.example != null ? (
                      <pre className="bg-gray-900 text-green-400 p-4 text-xs overflow-x-auto">
                        {JSON.stringify(response.content!['application/json']!.example, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SwaggerUI() {
  const spec = openApiSpec;

  // Extraire tous les endpoints
  const endpoints: { method: HttpMethod; path: string; details: EndpointProps['details'] }[] = [];
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods as Record<string, EndpointProps['details']>)) {
      endpoints.push({ method: method as HttpMethod, path, details });
    }
  }

  // Grouper par tag
  const grouped: Record<string, typeof endpoints> = {};
  endpoints.forEach(ep => {
    const tag = (ep.details as { tags?: string[] }).tags?.[0] || 'Autres';
    if (!grouped[tag]) grouped[tag] = [];
    grouped[tag].push(ep);
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Swagger */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6 rounded-xl mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-500 p-2 rounded-lg">
            <ExternalLink size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{spec.info.title}</h2>
            <span className="text-green-200 text-sm">OpenAPI {spec.openapi} | Version {spec.info.version}</span>
          </div>
        </div>
        <p className="text-green-100 text-sm mt-2 leading-relaxed">{spec.info.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs bg-green-600 px-3 py-1 rounded-full">🖥️ Serveur : {spec.servers[0].url}</span>
          <span className="text-xs bg-green-600 px-3 py-1 rounded-full">{spec.servers[0].description}</span>
        </div>
      </div>

      {/* Schéma Article */}
      <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Schéma : Article</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(spec.components.schemas.Article.properties).map(([key, val]) => {
            const v = val as { type: string; description: string; format?: string; items?: { type: string } };
            return (
              <div key={key} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                <code className="text-purple-700 font-mono text-sm font-bold">{key}</code>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {v.type === 'array' ? `array<${v.items?.type}>` : v.type}
                </span>
                {spec.components.schemas.Article.required.includes(key) && (
                  <span className="text-xs text-red-500 font-bold">*requis</span>
                )}
                <span className="text-xs text-gray-500 ml-auto">{String(v.description)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Endpoints groupés */}
      {Object.entries(grouped).map(([tag, eps]) => (
        <div key={tag} className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">{tag}</span>
            <span className="text-sm text-gray-500 font-normal">{eps.length} endpoint(s)</span>
          </h3>
          {eps.map((ep, i) => (
            <Endpoint key={i} method={ep.method} path={ep.path} details={ep.details} />
          ))}
        </div>
      ))}
    </div>
  );
}
