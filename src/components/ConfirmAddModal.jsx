import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { badgeTextStyle, randomId } from '../lib/utils';
import { submitApplication } from '../lib/db';
import Modal from './Modal';

/**
 * Admin "confirmed member" form. Unlike a reservation (headcount only),
 * this creates a full application identical to a normal sign-up — real
 * character name + realm — so WCL / Raider.io links work. The only marker
 * differentiating it from a real applicant is the registrant nickname
 * "관리자가 생성".
 */
export default function ConfirmAddModal({ open, onClose, raid, role }) {
  const { gamedata } = useApp();
  const defaultServer =
    (gamedata.servers.find((s) => s.isDefault) || gamedata.servers[0])?.ko || '아즈샤라';

  const [charName, setCharName] = useState('');
  const [server, setServer] = useState(defaultServer);
  const [classId, setClassId] = useState('');
  const [specId, setSpecId] = useState('');
  const [ilvl, setIlvl] = useState('');
  const [memoText, setMemoText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setCharName('');
      setServer(defaultServer);
      setClassId('');
      setSpecId('');
      setIlvl('');
      setMemoText('');
      setError('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = gamedata.classes.find((c) => c.id === classId);
  const roleSpecs = cls ? cls.specs.filter((s) => s.role === role) : [];
  const spec = roleSpecs.find((s) => s.id === specId);
  const roleLabel = role === 'tank' ? '탱커' : role === 'healer' ? '힐러' : '딜러';

  const submit = async () => {
    setError('');
    if (!charName.trim()) {
      setError('캐릭터명을 입력해주세요.');
      return;
    }
    if (!classId) {
      setError('직업을 선택해주세요.');
      return;
    }
    if (role === 'dps' && !specId) {
      setError('딜러는 특성을 선택해주세요.');
      return;
    }
    setBusy(true);
    try {
      const appId = randomId('cfm_');
      await submitApplication(
        raid.id,
        appId,
        {
          userId: null,
          nickname: '관리자가 생성',
          guildId: 'sad',
          guildName: 'Team SAD',
          guildColor: '#C9A84C',
          charId: null,
          charName: charName.trim(),
          server,
          classId,
          className: cls?.name || null,
          classColor: cls?.color || '#94a3b8',
          specId: spec?.id || null,
          specName: spec?.name || null,
          allSpecNames: spec ? [spec.name] : [],
          role,
          range: role === 'dps' ? (spec ? spec.range : null) : null,
          ilvl: ilvl ? Number(ilvl) : null,
          leaderCapable: false,
          isGuildMaster: false,
          swap: false,
          swapRoles: [],
          status: 'active',
          seq: Date.now(),
          isReservation: false,
          createdByAdmin: true,
          benchChars: [],
        },
        memoText
      );
      onClose(true);
    } catch {
      setError('확정 인원 등록에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => onClose(false)} title={`${roleLabel} 확정 인원 추가`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label-sm">캐릭터명 (필수)</label>
            <input
              className="input-base"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="실제 캐릭터명"
              maxLength={24}
            />
          </div>
          <div>
            <label className="label-sm">서버</label>
            <select className="input-base" value={server} onChange={(e) => setServer(e.target.value)}>
              {gamedata.servers.map((s) => (
                <option key={s.slug} value={s.ko}>
                  {s.ko}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-sm">직업 (필수)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {gamedata.classes
              .filter((c) => c.specs.some((s) => s.role === role))
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setClassId(c.id);
                    setSpecId('');
                  }}
                  className={`px-1 py-2 rounded-lg text-xs font-semibold border transition ${
                    classId === c.id
                      ? 'border-indigo-400 bg-base-700'
                      : 'border-base-700 bg-base-800 hover:bg-base-700'
                  }`}
                  style={badgeTextStyle(c.color)}
                >
                  {c.name}
                </button>
              ))}
          </div>
        </div>

        {cls && roleSpecs.length > 0 && (
          <div>
            <label className="label-sm">
              특성 <span className="text-base-400 font-normal">{role === 'dps' ? '(필수)' : '(선택)'}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roleSpecs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpecId(s.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    specId === s.id
                      ? 'border-indigo-400 bg-indigo-500/15'
                      : 'border-base-700 bg-base-850 hover:bg-base-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label-sm">아이템 레벨 (선택)</label>
          <input
            className="input-base"
            value={ilvl}
            onChange={(e) => setIlvl(e.target.value.replace(/\D/g, ''))}
            placeholder="예: 290"
            maxLength={4}
          />
        </div>

        <div>
          <label className="label-sm">관리자 메모 (선택)</label>
          <textarea
            className="input-base min-h-[56px] resize-y"
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            placeholder="관리자만 볼 수 있는 메모"
          />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <button type="button" className="btn-primary w-full" disabled={busy} onClick={submit}>
          {busy ? '등록 중...' : '확정 인원 등록'}
        </button>
      </div>
    </Modal>
  );
}
